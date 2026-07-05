import Planck from "planck-js"
import { ConnectorSensorSpec } from "../../bots/specs"
import { nextId } from "../../util"
import { defaultShapePhysics, EntityCircleShapeSpec, defaultCircleShape, defaultEntityShape, defaultColorBrush } from "../specs"

type BotRef = {
    entity: { physicsObj: { body: Planck.Body } }
    pos: { x: number; y: number }
    angle: number
}

export class GraySensor {
    public _fixtureLabel: string
    private _fixture: Planck.Fixture | null = null
    private _value = 0

    public get value(): number { return this._value }

    constructor(private bot: BotRef, private spec: ConnectorSensorSpec) {
        this._fixtureLabel = spec.name + ".sensor." + nextId()
        this.createFixture()
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

    public read(): number {
        this._value = 0
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
        return this._value
    }

    public destroy(): void {
        if (this._fixture) {
            this.bot.entity.physicsObj.body.destroyFixture(this._fixture)
            this._fixture = null
        }
    }
}
