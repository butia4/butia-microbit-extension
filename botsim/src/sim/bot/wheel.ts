import { Vec2 } from "../../types/vec2"
import { WheelSpec } from "../../bots/specs"
import { defaultEntityShape, defaultBoxShape, defaultShapePhysics, defaultColorBrush, EntityShapeSpec } from "../specs"

type BotRef = {
    entity: { physicsObj: import("../physics").PhysicsObject }
    pos: import("../../types/vec2").Vec2Like
    angle: number
    forward: import("../../types/vec2").Vec2Like
    held: boolean
    paused: boolean
}

export class Wheel {
    private currSpeed = 0
    private localPos: import("../../types/vec2").Vec2Like

    public static makeShapeSpec(_botSpec: unknown, wheelSpec: WheelSpec): EntityShapeSpec {
        return {
            ...defaultEntityShape(),
            ...defaultBoxShape(),
            label: wheelSpec.name,
            roles: ["mouse-target", "robot"],
            offset: wheelSpec.pos,
            size: { x: wheelSpec.width, y: wheelSpec.radius * 2 },
            physics: { ...defaultShapePhysics(), friction: 0.2, restitution: 0.2, density: 10 },
            brush: { ...defaultColorBrush(), fillColor: "#212738", borderColor: "black", borderWidth: 0.2, zIndex: 6 },
        }
    }

    constructor(private bot: BotRef, private spec: WheelSpec) {
        this.localPos = spec.pos
        const friction = this.bot.entity.physicsObj.addFrictionJoint(this.spec.pos)
        if (friction) {
            ;(friction as unknown as { m_bodyB: { setAngularDamping(v: number): void; setLinearDamping(v: number): void } }).m_bodyB?.setAngularDamping(10)
            ;(friction as unknown as { m_bodyB: { setAngularDamping(v: number): void; setLinearDamping(v: number): void } }).m_bodyB?.setLinearDamping(10)
        }
    }

    public setSpeed(pct: number): void {
        this.currSpeed = this.spec.maxSpeed * Math.max(-1, Math.min(1, pct / 100))
    }

    public update(dtSecs: number): void {
        if (this.bot.held || this.bot.paused) return
        this.updateFriction()
        this.updateForce()
        void dtSecs
    }

    private updateFriction(): void {
        const worldPos = this.bot.entity.physicsObj.getWorldPoint(this.localPos)
        const angVel = this.bot.entity.physicsObj.getAngularVelocity()
        const maxAV = 10
        this.bot.entity.physicsObj.applyAngularForce(
            -angVel * this.bot.entity.physicsObj.body.getInertia()
        )
        if (Math.abs(angVel) > maxAV) {
            this.bot.entity.physicsObj.setAngularVelocity(maxAV * Math.sign(angVel))
        }
        const lateralVel = this.bot.entity.physicsObj.getLateralVelocity(worldPos)
        this.bot.entity.physicsObj.applyForce(
            Vec2.scale(Vec2.neg(lateralVel), 3 * this.bot.entity.physicsObj.body.getMass()),
            worldPos
        )
    }

    private updateForce(): void {
        const worldPos = this.bot.entity.physicsObj.getWorldPoint(this.localPos)
        const force = Vec2.scale(this.bot.forward, this.currSpeed * 4.5 * this.bot.entity.physicsObj.body.getMass())
        this.bot.entity.physicsObj.applyForce(force, worldPos)
    }

    public destroy(): void {}
}
