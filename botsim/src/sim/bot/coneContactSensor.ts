import * as Planck from "planck"
import { Vec2, Vec2Like } from "../../types/vec2"
import { LineSegment } from "../../types/line"
import { nextId } from "../../util"
import { RangeSensorSpec } from "../../botSpecs/botSpec"
import {
    defaultEntityShape, defaultPolygonShape, defaultShapePhysics, defaultColorBrush,
    EntityPolygonShapeSpec,
} from "../entitySpec"
import { appoximateArc, pointInPolygon, testOverlap, Rgb } from "../util"
import { buildSonarVisuals, updateSonarVisuals } from "./sonarVisuals"
import { BotHandle } from "./botHandle"

// Config-object-driven generic replacing the near-duplicate cone-cast/raycast
// logic that used to live separately in RangeSensor and LightSensor. Both
// sensors share identical cone geometry, contact-detection, and visuals code
// — they differ only in which fixture role they look for and how the
// detected distance maps to the sensor's output value (see RangeSensor's
// `RANGE_CONFIG` / LightSensor's `LIGHT_CONFIG` thin-wrapper configs).
export interface ConeSensorConfig {
    roleTag: string // e.g. "obstacle" | "light-source" — role tag matched on the other fixture
    labelPrefix: string // e.g. "range" | "light" — used to build this._fixtureLabel/_waveLabel/_targetLabel
    defaultValue: number // initial `value` before the first read() (e.g. MAX_RANGE | 0)
    mapDistance: (distance: number, maxRange: number) => number // raw detected distance -> sensor output
    sonarColor: { wave: Rgb; ping: Rgb }
}

export class ConeContactSensor {
    public _fixtureLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _value: number
    private used = false
    private _fixture: Planck.Fixture | null = null
    private sensorVerts: Vec2Like[] = []
    private sensorEdges: ReturnType<typeof LineSegment.like>[] = []

    public get value(): number { return this._value }

    constructor(
        private bot: BotHandle,
        private spec: RangeSensorSpec,
        private config: ConeSensorConfig,
        private showCone: boolean = false,
    ) {
        this._value = config.defaultValue
        const id = nextId()
        this._fixtureLabel = config.labelPrefix + ".cone." + id
        this._waveLabel = config.labelPrefix + ".wave." + id
        this._targetLabel = config.labelPrefix + ".target." + id
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
        const facingDeg = this.spec.facingDeg ?? 0
        this.sensorVerts = [pLN, pRN, pRF, ...arc.reverse(), pLF, pLN].map(v => Vec2.rotateDeg(v, facingDeg))
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
     * Builds the pulse (ping) visual mesh and attaches it to the bot's render
     * object. Delegates mesh-building to the shared `sonarVisuals.ts` helper
     * (the sonar wave/cone mesh is disabled there by default — see that
     * file). `showCone` opts a sensor into also building the persistent
     * wave/cone mesh (currently only used by LightSensor).
     */
    private buildVisuals(): void {
        buildSonarVisuals(
            this.bot.entity.renderObj,
            this.spec.pos,
            this.spec.angle,
            this.spec.maxRange,
            this._waveLabel,
            this._targetLabel,
            this.config.sonarColor,
            this.showCone,
            this.spec.facingDeg,
        )
    }

    public read(): number {
        this.used = true
        this._value = this.config.defaultValue
        const body = this.bot.entity.physicsObj.body
        const botPos = this.bot.pos
        const botAngle = this.bot.angle
        const sensorPos = Vec2.transformDeg(this.spec.pos, botPos, botAngle)

        // Transform cone to world space
        const worldVerts = this.sensorVerts.map(v => Vec2.transformDeg(v, sensorPos, botAngle))
        const worldEdges = this.sensorEdges.map(e => LineSegment.transformDeg(e, sensorPos, botAngle))

        const detectedVerts: Vec2Like[] = []

        const isTarget = (roles: string[]) => roles.includes(this.config.roleTag)
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

            let targetFix: Planck.Fixture | null = null
            if (dA?.label === this._fixtureLabel && dB?.roles && isTarget(dB.roles) && !isMe(fB) && testOverlap(fA, fB)) targetFix = fB
            else if (dB?.label === this._fixtureLabel && dA?.roles && isTarget(dA.roles) && !isMe(fA) && testOverlap(fA, fB)) targetFix = fA
            if (!targetFix) continue

            const shape = targetFix.getShape()
            const itPos = targetFix.getBody().getPosition()
            const itAngle = targetFix.getBody().getAngle()

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

        this._value = this.config.mapDistance(distance, this.spec.maxRange)

        this.updateVisuals(nearest, botPos, botAngle)

        return this._value
    }

    private updateVisuals(nearest: Vec2Like | undefined, botPos: Vec2Like, botAngle: number): void {
        updateSonarVisuals(
            this.bot.entity.renderObj?.shapes,
            this.used,
            nearest,
            this._targetLabel,
            botPos,
            botAngle,
        )
    }

    public destroy(): void {
        if (this._fixture) {
            this.bot.entity.physicsObj.body.destroyFixture(this._fixture)
            this._fixture = null
        }
    }
}
