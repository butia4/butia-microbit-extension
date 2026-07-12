import * as Planck from "planck"
import { MountSensorSpec } from "../../botSpecs/botSpec"
import { Vec2 } from "../../types/vec2"
import { nextId } from "../../util"
import { defaultShapePhysics, EntityCircleShapeSpec, defaultCircleShape, defaultEntityShape, defaultColorBrush } from "../entitySpec"
import { Rgb } from "../util"
import { buildSonarVisuals, DEFAULT_GRAY_COLOR_ANGLE, GRAY_MAX_RANGE, updateSonarVisuals } from "./sonarVisuals"
import { DistanceSensor } from "./rangeSensor"
import { BotHandle } from "./botHandle"

// Config-object-driven generic replacing the near-duplicate point-overlap
// fixture/contact logic that used to live separately in GraySensor and
// SurfaceSensor. Both sensors share identical small-circle fixture creation,
// single-contact-role detection, and visuals code — they differ only in
// which fixture role they look for and which on/off values they report (see
// GraySensor's `GRAY_CONFIG` / SurfaceSensor's `SURFACE_CONFIG` thin-wrapper
// configs).
export interface PointSensorConfig {
    roleTag: string // e.g. "follow-line" | "table-surface" — role matched on the other fixture
    onValue: number // value reported while overlapping a roleTag-tagged fixture (e.g. 1023 | SURFACE_ON_VALUE)
    offValue: number // value reported otherwise (e.g. 0 | MAX_RANGE)
    labelSuffix: string // e.g. "sensor" | "surface" — this._fixtureLabel = spec.name + "." + labelSuffix + "." + id
    wavePrefix: string // e.g. "gray" | "surface" — this._waveLabel/_targetLabel = wavePrefix + ".wave./.target." + id
    ownRoles: string[] // roles tagged on this sensor's own fixture (e.g. ["gray-sensor"] | [])
    sonarColor: { wave: Rgb; ping: Rgb }
}

export class PointContactSensor implements DistanceSensor {
    public _fixtureLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _fixture: Planck.Fixture | null = null
    private _value: number
    private used = false

    public get value(): number { return this._value }

    constructor(
        private bot: BotHandle,
        private spec: MountSensorSpec,
        private config: PointSensorConfig,
    ) {
        this._value = config.offValue
        const id = nextId()
        this._fixtureLabel = spec.name + "." + config.labelSuffix + "." + id
        this._waveLabel = config.wavePrefix + ".wave." + id
        this._targetLabel = config.wavePrefix + ".target." + id
        this.createFixture()
        this.buildVisuals()
    }

    private createFixture(): void {
        const shapeSpec: EntityCircleShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: this._fixtureLabel,
            offset: this.spec.pos,
            radius: 0.5,
            roles: this.config.ownRoles,
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: { ...defaultColorBrush(), visible: false },
        }
        const body = this.bot.entity.physicsObj.body
        const fixture = body.createFixture(
            Planck.Circle(Planck.Vec2(shapeSpec.offset.x, shapeSpec.offset.y), shapeSpec.radius),
            { isSensor: true, density: 0, userData: shapeSpec }
        )
        this._fixture = fixture
    }

    /**
     * Builds the pulse (ping) visual mesh for this sensor's beam.
     * Unconditional: always builds a mesh, even when `spec.angle` is unset
     * (falls back to DEFAULT_GRAY_COLOR_ANGLE) — there is no no-beam state.
     * The sonar wave/cone mesh is disabled — see `sonarVisuals.ts`.
     */
    private buildVisuals(): void {
        buildSonarVisuals(
            this.bot.entity.renderObj,
            this.spec.pos,
            this.spec.angle ?? DEFAULT_GRAY_COLOR_ANGLE,
            GRAY_MAX_RANGE,
            this._waveLabel,
            this._targetLabel,
            this.config.sonarColor,
        )
    }

    private updateVisuals(): void {
        const nearest = this._value === this.config.onValue
            ? Vec2.transformDeg(this.spec.pos, this.bot.pos, this.bot.angle)
            : undefined
        updateSonarVisuals(
            this.bot.entity.renderObj?.shapes,
            this.used,
            nearest,
            this._targetLabel,
            this.bot.pos,
            this.bot.angle,
        )
    }

    public read(): number {
        this._value = this.config.offValue
        this.used = true // sensor is actively polled — beam is always shown once reading starts
        const body = this.bot.entity.physicsObj.body

        for (let ce = body.getContactList(); ce; ce = ce.next ?? null) {
            const contact = ce.contact
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()
            const dataA = fixtureA.getUserData() as { label?: string; roles?: string[] } | null
            const dataB = fixtureB.getUserData() as { label?: string; roles?: string[] } | null

            const isMine = (d: { label?: string } | null) => d?.label === this._fixtureLabel
            const isTarget = (d: { roles?: string[] } | null) => d?.roles?.includes(this.config.roleTag) ?? false

            if ((isMine(dataA) && isTarget(dataB)) || (isMine(dataB) && isTarget(dataA))) {
                this._value = this.config.onValue
                break
            }
        }

        this.updateVisuals()

        return this._value
    }

    public destroy(): void {
        if (this._fixture) {
            this.bot.entity.physicsObj.body.destroyFixture(this._fixture)
            this._fixture = null
        }
    }
}
