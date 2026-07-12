import * as Planck from "planck"
import { MountSensorSpec } from "../../bots/specs"
import { Vec2 } from "../../types/vec2"
import { nextId } from "../../util"
import { defaultShapePhysics, EntityCircleShapeSpec, defaultCircleShape, defaultEntityShape, defaultColorBrush } from "../specs"
import { RenderObject } from "../renderer"
import { buildSonarVisuals, DEFAULT_GRAY_COLOR_ANGLE, GRAY_MAX_RANGE, SONAR_COLORS, updateSonarVisuals } from "./sonarVisuals"

type BotRef = {
    entity: { physicsObj: { body: Planck.Body }; renderObj?: RenderObject }
    pos: { x: number; y: number }
    angle: number
}

export class GraySensor {
    public _fixtureLabel: string
    private _waveLabel: string
    private _targetLabel: string
    private _fixture: Planck.Fixture | null = null
    private _value = 0
    private used = false

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: MountSensorSpec) {
        const id = nextId()
        this._fixtureLabel = spec.name + ".sensor." + id
        this._waveLabel = "gray.wave." + id
        this._targetLabel = "gray.target." + id
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
            roles: ["gray-sensor"],
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
            SONAR_COLORS.gray,
        )
    }

    private updateVisuals(): void {
        const nearest = this._value === 1023
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
        this._value = 0
        this.used = true // sensor is actively polled — beam is always shown once reading starts
        const body = this.bot.entity.physicsObj.body

        for (let ce = body.getContactList(); ce; ce = ce.next ?? null) {
            const contact = ce.contact
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()
            const dataA = fixtureA.getUserData() as { label?: string; roles?: string[] } | null
            const dataB = fixtureB.getUserData() as { label?: string; roles?: string[] } | null

            const isMine = (d: { label?: string } | null) => d?.label === this._fixtureLabel
            const isLine = (d: { roles?: string[] } | null) => d?.roles?.includes("follow-line") ?? false

            if ((isMine(dataA) && isLine(dataB)) || (isMine(dataB) && isLine(dataA))) {
                this._value = 1023
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
