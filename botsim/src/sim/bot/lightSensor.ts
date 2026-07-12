import * as Planck from "planck"
import { Vec2, Vec2Like } from "../../types/vec2"
import { LineSegment } from "../../types/line"
import { nextId } from "../../util"
import { RangeSensorSpec } from "../../bots/specs"
import {
    defaultEntityShape, defaultPolygonShape, defaultShapePhysics, defaultColorBrush,
    EntityPolygonShapeSpec,
} from "../specs"
import { appoximateArc, pointInPolygon, testOverlap } from "../util"
import { RenderObject } from "../renderer"
import { buildSonarVisuals, SONAR_COLORS, updateSonarVisuals } from "./sonarVisuals"

export const LIGHT_MAX_RANGE = 40 // cm

// Default cone angle applied when a connector spec omits `angle` — a midpoint
// between RangeSensor's narrow 30° (long-range obstacle beam) and Gray/Color's
// wide 70° (near-field contact): wide enough that left/right mounts get
// overlapping readings to steer on, narrow enough to stay directional.
export const DEFAULT_LIGHT_ANGLE = 45 // degrees

// Sibling class to RangeSensor — same cone/raycast fixture and world-space
// edge-intersection geometry (design decision: separate classes, not a
// shared abstraction — role filter and output transform differ enough that a
// shared base would need conditionals, which this codebase avoids elsewhere).
// Detects entities tagged "light-source" and converts nearest-hit distance
// into a 0-100 intensity via linear falloff, instead of RangeSensor's raw cm.
type BotRef = {
    entity: { physicsObj: { body: Planck.Body }; renderObj?: RenderObject }
    pos: Vec2Like
    angle: number
    forward: Vec2Like
}

export class LightSensor {
    public _fixtureLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _value = 0
    private used = false
    private _fixture: Planck.Fixture | null = null
    private sensorVerts: Vec2Like[] = []
    private sensorEdges: ReturnType<typeof LineSegment.like>[] = []

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: RangeSensorSpec) {
        const id = nextId()
        this._fixtureLabel = "light.cone." + id
        this._waveLabel = "light.wave." + id
        this._targetLabel = "light.target." + id
        this.buildCone()
        this.buildVisuals()
    }

    private buildCone(): void {
        const hw = 2
        const pLN = Vec2.like(-hw, 0)
        const pRN = Vec2.like(hw, 0)
        const pLF = Vec2.rotateDeg(Vec2.add(pLN, Vec2.like(0, -this.spec.maxRange)), -this.spec.angle / 2)
        const pRF = Vec2.rotateDeg(Vec2.add(pRN, Vec2.like(0, -this.spec.maxRange)),  this.spec.angle / 2)
        const arc = appoximateArc({ x: 0, y: 0 }, this.spec.maxRange, -this.spec.angle / 2 - 90, this.spec.angle / 2 - 90, 4)
        this.sensorVerts = [pLN, pRN, pRF, ...arc.reverse(), pLF, pLN]
        for (let i = 1; i < this.sensorVerts.length; i++) {
            this.sensorEdges.push(LineSegment.like(this.sensorVerts[i - 1], this.sensorVerts[i]))
        }

        const shapeSpec: EntityPolygonShapeSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this._fixtureLabel,
            offset: this.spec.pos,
            verts: this.sensorVerts.slice(0, 8),
            roles: [],
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: { ...defaultColorBrush(), visible: false },
        }
        const offset = this.spec.pos
        const verts = shapeSpec.verts.slice(0, 8).map(v => Vec2.add(v, offset))
        this._fixture = this.bot.entity.physicsObj.body.createFixture(
            Planck.Polygon(verts.map(v => Planck.Vec2(v.x, v.y))),
            { isSensor: true, density: 0, userData: shapeSpec }
        )
    }

    /**
     * Builds the pulse (ping) visual mesh, mirroring RangeSensor.buildVisuals
     * — attached after construction via RenderObject.addShape. Delegates
     * mesh-building to the shared `sonarVisuals.ts` helper.
     */
    private buildVisuals(): void {
        buildSonarVisuals(
            this.bot.entity.renderObj,
            this.spec.pos,
            this.spec.angle,
            this.spec.maxRange,
            this._waveLabel,
            this._targetLabel,
            SONAR_COLORS.light,
        )
    }

    public read(): number {
        this.used = true
        this._value = 0
        const body = this.bot.entity.physicsObj.body
        const botPos = this.bot.pos
        const botAngle = this.bot.angle
        const sensorPos = Vec2.transformDeg(this.spec.pos, botPos, botAngle)

        // Transform cone to world space
        const worldVerts = this.sensorVerts.map(v => Vec2.transformDeg(v, sensorPos, botAngle))
        const worldEdges = this.sensorEdges.map(e => LineSegment.transformDeg(e, sensorPos, botAngle))

        const detectedVerts: Vec2Like[] = []

        const isLightSource = (roles: string[]) => roles.includes("light-source")
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

            let lightFix: Planck.Fixture | null = null
            if (dA?.label === this._fixtureLabel && dB?.roles && isLightSource(dB.roles) && !isMe(fB) && testOverlap(fA, fB)) lightFix = fB
            else if (dB?.label === this._fixtureLabel && dA?.roles && isLightSource(dA.roles) && !isMe(fA) && testOverlap(fA, fB)) lightFix = fA
            if (!lightFix) continue

            const shape = lightFix.getShape()
            const itPos = lightFix.getBody().getPosition()
            const itAngle = lightFix.getBody().getAngle()

            if (shape.getType() === "polygon") {
                const poly = shape as Planck.Polygon
                const verts = poly.m_vertices.map((v: Vec2Like) => Vec2.transform(v, itPos, itAngle))
                for (let i = 1; i < verts.length; i++) ingestEdge(verts[i - 1], verts[i])
                if (verts.length > 1) ingestEdge(verts[verts.length - 1], verts[0])
            }
        }

        let nearest: Vec2Like | undefined
        let distance = this.spec.maxRange
        if (detectedVerts.length > 0) {
            detectedVerts.sort((a, b) => Vec2.distSq(a, sensorPos) - Vec2.distSq(b, sensorPos))
            nearest = detectedVerts[0]
            distance = Vec2.dist(nearest, sensorPos)
        }

        const raw = 100 * (1 - distance / LIGHT_MAX_RANGE)
        this._value = Math.round(Math.min(100, Math.max(0, raw)))

        this.updateVisuals(nearest, botPos, botAngle)

        return this._value
    }

    private updateVisuals(nearest: Vec2Like | undefined, botPos: Vec2Like, botAngle: number): void {
        updateSonarVisuals(
            this.bot.entity.renderObj?.shapes,
            this.used,
            nearest,
            this._waveLabel,
            this._targetLabel,
            botPos,
            botAngle,
        )
    }

    public destroy(): void {
        // Mirrors GraySensor's destroy() lifecycle shape. Not currently
        // called by Bot.destroy() (pre-existing gap — RangeSensor also has
        // no destroy() — out of scope for this change).
        if (this._fixture) {
            this.bot.entity.physicsObj.body.destroyFixture(this._fixture)
            this._fixture = null
        }
    }
}
