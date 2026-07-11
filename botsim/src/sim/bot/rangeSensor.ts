import Planck from "planck-js"
import { Vec2, Vec2Like } from "../../types/vec2"
import { LineSegment } from "../../types/line"
import { RENDER_SCALE } from "../../constants"
import { nextId, toRadians } from "../../util"
import { RangeSensorSpec } from "../../bots/specs"
import {
    defaultEntityShape, defaultPolygonShape, defaultShapePhysics, defaultColorBrush,
    defaultShaderBrush, EntityPolygonShapeSpec,
} from "../specs"
import { appoximateArc, pointInPolygon, rgbToFloatArray, testOverlap, toRenderScale } from "../util"
import { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals, createGraphics, RenderObject } from "../renderer"

export const MAX_RANGE = 400 // cm

// Shared read interface so `Bot` can hold either a `RangeSensor` (cone-raycast)
// or a `SurfaceSensor` (point-overlap) behind one map type without casts.
export interface DistanceSensor {
    read(): number
    readonly value: number
}

const waveColor = { r: 0x68, g: 0xae, b: 0xd4 }
const pingColor = { r: 0xff, g: 0x3f, b: 0x3f }
const pingRadius = 3 // cm

// Ported near-verbatim from microbit-robot/botsim/src/sim/bot/rangeSensor.ts
addShaderProgram(
    "sonar_wave",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
    uniform vec3 uColor;
    uniform float uMaxRange;
    uniform float uBeamAngle;

    float dist(vec2 p0, vec2 p1) {
        return sqrt(pow(p1.x - p0.x, 2.) + pow(p1.y - p0.y, 2.));
    }
    float angle(vec2 p0, vec2 p1) {
        return atan(p1.y - p0.y, p1.x - p0.x) + 1.57;
    }
    void main() {
        vec2 uv = vUvs;
        uv = vec2(uv.x * uAspectRatio, uv.y);
        vec2 ofs = vec2(0.265, 1.1); // hand-tuned to appear to emanate from the sensor
        float maxRange = uMaxRange + ofs.y;
        float maxAngle = uBeamAngle / 2.;
        float waveSpeed = 5.;
        float waveCount = 22.;
        float d = dist(ofs, uv);
        float c = mod(uTime * waveSpeed - d * waveCount, 1.);
        c = 1. - c;
        c = c * c;
        c = .2 + c * .66;
        float alpha = c * .75;
        float linFade = 1. - smoothstep(0., 1., d - 0.33);
        float angFade = 1. - smoothstep(0., 1., -0.5 + abs(angle(ofs, uv)) / maxAngle);
        alpha *= linFade * angFade;
        gl_FragColor = vec4(uColor * alpha, alpha);
    }`
)

addShaderProgram(
    "sonar_ping",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
    uniform vec3 uColor;

    float dist(vec2 p0, vec2 p1) {
        return sqrt(pow(p1.x - p0.x, 2.) + pow(p1.y - p0.y, 2.));
    }
    void main() {
        vec2 uv = vUvs;
        uv = vec2(uv.x * uAspectRatio, uv.y);
        float innerMargin = 0.1;
        float outerMargin = 0.05;
        float pingDuration = 1.;
        float pingSpeed = 0.5;
        float r = dist(uv, vec2(0.5, 0.5));
        float time = mod(uTime, pingDuration) * pingSpeed;
        float alpha = smoothstep(time - innerMargin, time, r) * smoothstep(time + outerMargin, time, r);
        float fade = smoothstep(0.5, 0., r);
        vec4 color = vec4(uColor * alpha * fade, alpha * fade);
        gl_FragColor = color;
    }`
)

type BotRef = {
    entity: { physicsObj: { body: Planck.Body }; renderObj?: RenderObject }
    pos: Vec2Like
    angle: number
    forward: Vec2Like
}

export class RangeSensor {
    public _coneLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _value = MAX_RANGE
    private used = false
    private sensorVerts: Vec2Like[] = []
    private sensorEdges: ReturnType<typeof LineSegment.like>[] = []

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: RangeSensorSpec) {
        const id = nextId()
        this._coneLabel = "range.cone." + id
        this._waveLabel = "range.wave." + id
        this._targetLabel = "range.target." + id
        this.buildCone()
        this.buildVisuals()
    }

    private buildCone(): void {
        const hw = 2
        const pLN = Vec2.like(-hw, 0)
        const pRN = Vec2.like(hw, 0)
        const pLF = Vec2.rotateDeg(Vec2.add(pLN, Vec2.like(0, -this.spec.maxRange)), -this.spec.beamAngle / 2)
        const pRF = Vec2.rotateDeg(Vec2.add(pRN, Vec2.like(0, -this.spec.maxRange)),  this.spec.beamAngle / 2)
        const arc = appoximateArc({ x: 0, y: 0 }, this.spec.maxRange, -this.spec.beamAngle / 2 - 90, this.spec.beamAngle / 2 - 90, 4)
        this.sensorVerts = [pLN, pRN, pRF, ...arc.reverse(), pLF, pLN]
        for (let i = 1; i < this.sensorVerts.length; i++) {
            this.sensorEdges.push(LineSegment.like(this.sensorVerts[i - 1], this.sensorVerts[i]))
        }

        const shapeSpec: EntityPolygonShapeSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this._coneLabel,
            offset: this.spec.pos,
            verts: this.sensorVerts.slice(0, 8),
            roles: [],
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: { ...defaultColorBrush(), visible: false },
        }
        const offset = this.spec.pos
        const verts = shapeSpec.verts.slice(0, 8).map(v => Vec2.add(v, offset))
        this.bot.entity.physicsObj.body.createFixture(
            Planck.Polygon(verts.map(v => Planck.Vec2(v.x, v.y))),
            { isSensor: true, density: 0, userData: shapeSpec }
        )
    }

    /**
     * Builds the sonar wave/ping visual meshes and attaches them to the bot's
     * render object (decision #4: attached after construction via
     * RenderObject.addShape, since RangeSensor is constructed after the bot
     * entity already exists). Both start invisible and are toggled by
     * `used`/detection state in `read()`.
     */
    private buildVisuals(): void {
        const renderObj = this.bot.entity.renderObj
        if (!renderObj) return // e.g. in unit tests, where entity is a lightweight mock

        const waveSpec: EntityPolygonShapeSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this._waveLabel,
            offset: this.spec.pos,
            // Full (unsliced) cone verts — unlike the physics fixture above,
            // this is a Pixi mesh (earcut), not a Planck polygon body, so it
            // isn't bound by Planck's 8-vertex-per-polygon convention.
            verts: this.sensorVerts,
            roles: [],
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: {
                ...defaultShaderBrush(),
                shader: "sonar_wave",
                uniforms: {
                    uColor: rgbToFloatArray(waveColor),
                    uMaxRange: toRenderScale(this.spec.maxRange),
                    uBeamAngle: toRadians(this.spec.beamAngle),
                },
                visible: false,
                zIndex: 5,
            },
        }
        const targetSpec: EntityPolygonShapeSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this._targetLabel,
            offset: { x: 0, y: 0 },
            verts: [
                { x: -pingRadius, y: -pingRadius },
                { x: pingRadius, y: -pingRadius },
                { x: pingRadius, y: pingRadius },
                { x: -pingRadius, y: pingRadius },
            ],
            roles: [],
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: {
                ...defaultShaderBrush(),
                shader: "sonar_ping",
                uniforms: { uColor: rgbToFloatArray(pingColor) },
                visible: false,
                zIndex: 6,
            },
        }

        const waveGfx = createGraphics.polygon.shader(waveSpec, waveSpec.brush)
        renderObj.addShape(this._waveLabel, waveGfx)
        const targetGfx = createGraphics.polygon.shader(targetSpec, targetSpec.brush)
        renderObj.addShape(this._targetLabel, targetGfx)
    }

    public read(): number {
        this.used = true
        this._value = this.spec.maxRange
        const body = this.bot.entity.physicsObj.body
        const botPos = this.bot.pos
        const botAngle = this.bot.angle
        const sensorPos = Vec2.transformDeg(this.spec.pos, botPos, botAngle)

        // Transform cone to world space
        const worldVerts = this.sensorVerts.map(v => Vec2.transformDeg(v, sensorPos, botAngle))
        const worldEdges = this.sensorEdges.map(e => LineSegment.transformDeg(e, sensorPos, botAngle))

        const detectedVerts: Vec2Like[] = []

        const isObstacle = (roles: string[]) => roles.includes("obstacle")
        const isMe = (f: Planck.Fixture) => f.getBody() === body

        const ingestEdge = (p0: Vec2Like, p1: Vec2Like) => {
            if (pointInPolygon(p0, worldVerts)) detectedVerts.push(p0)
            if (pointInPolygon(p1, worldVerts)) detectedVerts.push(p1)
            const isects = LineSegment.intersectionAll({ p0, p1 }, worldEdges)
            for (const isect of isects) {
                if (isect.type === "point") detectedVerts.push(isect.p)
            }
        }

        for (let ce = body.getContactList(); ce; ce = ce.next ?? null) {
            const contact = ce.contact
            const fA = contact.getFixtureA()
            const fB = contact.getFixtureB()
            const dA = fA.getUserData() as { label?: string; roles?: string[] } | null
            const dB = fB.getUserData() as { label?: string; roles?: string[] } | null

            let obstacleFix: Planck.Fixture | null = null
            if (dA?.label === this._coneLabel && dB?.roles && isObstacle(dB.roles) && !isMe(fB) && testOverlap(fA, fB)) obstacleFix = fB
            else if (dB?.label === this._coneLabel && dA?.roles && isObstacle(dA.roles) && !isMe(fA) && testOverlap(fA, fB)) obstacleFix = fA
            if (!obstacleFix) continue

            const shape = obstacleFix.getShape()
            const itPos = obstacleFix.getBody().getPosition()
            const itAngle = obstacleFix.getBody().getAngle()

            if (shape.getType() === "polygon") {
                const poly = shape as Planck.Polygon
                const verts = poly.m_vertices.map((v: Vec2Like) => Vec2.transform(v, itPos, itAngle))
                for (let i = 1; i < verts.length; i++) ingestEdge(verts[i - 1], verts[i])
                if (verts.length > 1) ingestEdge(verts[verts.length - 1], verts[0])
            }
        }

        let nearest: Vec2Like | undefined
        if (detectedVerts.length > 0) {
            detectedVerts.sort((a, b) => Vec2.distSq(a, sensorPos) - Vec2.distSq(b, sensorPos))
            nearest = detectedVerts[0]
            this._value = Vec2.dist(nearest, sensorPos)
        }

        this.updateVisuals(nearest, botPos, botAngle)

        return this._value
    }

    private updateVisuals(nearest: Vec2Like | undefined, botPos: Vec2Like, botAngle: number): void {
        const shapes = this.bot.entity.renderObj?.shapes
        if (!shapes) return // e.g. in unit tests, where entity is a lightweight mock

        const wave = shapes.get(this._waveLabel)
        if (wave) wave.visible = this.used

        const target = shapes.get(this._targetLabel)
        if (target) {
            target.visible = this.used && !!nearest
            if (nearest) {
                const local = Vec2.scale(Vec2.untransformDeg(nearest, botPos, botAngle), RENDER_SCALE)
                target.position.set(local.x, local.y)
            }
        }
    }
}
