import Planck from "planck-js"
import { ConnectorSensorSpec } from "../../bots/specs"
import { nextId } from "../../util"
import { defaultShapePhysics, EntityCircleShapeSpec, defaultCircleShape, defaultEntityShape, defaultColorBrush } from "../specs"
import { DistanceSensor, MAX_RANGE } from "./rangeSensor"

export const SURFACE_ON_VALUE = 5 // cm

type BotRef = {
    entity: { physicsObj: { body: Planck.Body } }
}

// Heading-independent point-overlap distance sensor: reports a constant
// SURFACE_ON_VALUE while its mount point overlaps a "table-surface"-tagged
// shape, and MAX_RANGE otherwise. Mirrors GraySensor's fixture/contact
// pattern (small circle, sensor:true, density:0) but returns cm (distance
// sensor semantics) instead of an analog 0/1023 value.
export class SurfaceSensor implements DistanceSensor {
    public _fixtureLabel: string
    private _fixture: Planck.Fixture | null = null
    private _value = MAX_RANGE

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: ConnectorSensorSpec) {
        this._fixtureLabel = spec.name + ".surface." + nextId()
        this.createFixture()
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

    public read(): number {
        this._value = MAX_RANGE
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
        return this._value
    }

    public destroy(): void {
        if (this._fixture) {
            this.bot.entity.physicsObj.body.destroyFixture(this._fixture)
            this._fixture = null
        }
    }
}
