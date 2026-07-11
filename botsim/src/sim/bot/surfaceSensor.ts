import Planck from "planck-js"
import { MountSensorSpec } from "../../bots/specs"
import { Vec2 } from "../../types/vec2"
import { nextId } from "../../util"
import { defaultShapePhysics, EntityCircleShapeSpec, defaultCircleShape, defaultEntityShape, defaultColorBrush } from "../specs"
import { RenderObject } from "../renderer"
import { buildSonarVisuals, DEFAULT_GRAY_COLOR_ANGLE, GRAY_MAX_RANGE, SONAR_COLORS, updateSonarVisuals } from "./sonarVisuals"
import { DistanceSensor, MAX_RANGE } from "./rangeSensor"

export const SURFACE_ON_VALUE = 5 // cm

type BotRef = {
    entity: { physicsObj: { body: Planck.Body }; renderObj?: RenderObject }
    pos: { x: number; y: number }
    angle: number
}

// Heading-independent point-overlap distance sensor: reports a constant
// SURFACE_ON_VALUE while its mount point overlaps a "table-surface"-tagged
// shape, and MAX_RANGE otherwise. Mirrors GraySensor's fixture/contact
// pattern (small circle, sensor:true, density:0) but returns cm (distance
// sensor semantics) instead of an analog 0/1023 value.
export class SurfaceSensor implements DistanceSensor {
    public _fixtureLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _fixture: Planck.Fixture | null = null
    private _value = MAX_RANGE
    private used = false

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: MountSensorSpec) {
        const id = nextId()
        this._fixtureLabel = spec.name + ".surface." + id
        this._waveLabel = "surface.wave." + id
        this._targetLabel = "surface.target." + id
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
            roles: [],
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
     * Builds the sonar wave/ping visual meshes for this sensor's beam.
     * Unconditional: always builds a mesh, even when `spec.angle` is unset
     * (falls back to DEFAULT_GRAY_COLOR_ANGLE) — there is no no-beam state.
     */
    private buildVisuals(): void {
        buildSonarVisuals(
            this.bot.entity.renderObj,
            this.spec.pos,
            this.spec.angle ?? DEFAULT_GRAY_COLOR_ANGLE,
            GRAY_MAX_RANGE,
            this._waveLabel,
            this._targetLabel,
            SONAR_COLORS.surface,
        )
    }

    private updateVisuals(): void {
        const nearest = this._value === SURFACE_ON_VALUE
            ? Vec2.transformDeg(this.spec.pos, this.bot.pos, this.bot.angle)
            : undefined
        updateSonarVisuals(
            this.bot.entity.renderObj?.shapes,
            this.used,
            nearest,
            this._waveLabel,
            this._targetLabel,
            this.bot.pos,
            this.bot.angle,
        )
    }

    public read(): number {
        this._value = MAX_RANGE
        this.used = true // sensor is actively polled — beam is always shown once reading starts
        const body = this.bot.entity.physicsObj.body

        for (let ce = body.getContactList(); ce; ce = ce.next ?? null) {
            const contact = ce.contact
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()
            const dataA = fixtureA.getUserData() as { label?: string; roles?: string[] } | null
            const dataB = fixtureB.getUserData() as { label?: string; roles?: string[] } | null

            const isMine = (d: { label?: string } | null) => d?.label === this._fixtureLabel
            const isTable = (d: { roles?: string[] } | null) => d?.roles?.includes("table-surface") ?? false

            if ((isMine(dataA) && isTable(dataB)) || (isMine(dataB) && isTable(dataA))) {
                this._value = SURFACE_ON_VALUE
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
