import { Vec2 } from "../../types/vec2"
import { WheelSpec } from "../../botSpecs/botSpec"
import { defaultEntityShape, defaultBoxShape, defaultShapePhysics, defaultColorBrush, EntityShapeSpec } from "../entitySpec"
import { FrictionJointHandle } from "../physics"
import { BotHandle } from "./botHandle"

// Shared with Chassis.makeShapeSpec so chassis density can subtract the
// wheels' contribution to the composite body's total mass — otherwise the
// two fixture densities drift and the body ends up heavier than spec.mass.
export const WHEEL_DENSITY = 10

export class Wheel {
    private currSpeed = 0
    private localPos: import("../../types/vec2").Vec2Like
    private frictionJoint: FrictionJointHandle | undefined
    private frictionJointStrength = { maxForce: 0, maxTorque: 0 }
    private wasHeld = false

    public static makeShapeSpec(_botSpec: unknown, wheelSpec: WheelSpec): EntityShapeSpec {
        return {
            ...defaultEntityShape(),
            ...defaultBoxShape(),
            label: wheelSpec.name,
            roles: ["mouse-target", "robot"],
            offset: wheelSpec.pos,
            size: { x: wheelSpec.width, y: wheelSpec.radius * 2 },
            physics: { ...defaultShapePhysics(), friction: 0.2, restitution: 0.2, density: WHEEL_DENSITY },
            brush: { ...defaultColorBrush(), fillColor: "#212738", borderColor: "black", borderWidth: 0.2, zIndex: 6 },
        }
    }

    constructor(private bot: BotHandle, private spec: WheelSpec) {
        this.localPos = spec.pos
        const friction = this.bot.entity.physicsObj.addFrictionJoint(this.spec.pos)
        if (friction) {
            friction.m_bodyB?.setAngularDamping(10)
            friction.m_bodyB?.setLinearDamping(10)
            this.frictionJoint = friction
            this.frictionJointStrength = { maxForce: friction.getMaxForce(), maxTorque: friction.getMaxTorque() }
        }
    }

    public setSpeed(pct: number): void {
        this.currSpeed = Math.max(-this.spec.maxSpeed, Math.min(this.spec.maxSpeed, pct))
    }

    public update(dtSecs: number): void {
        // Keep the wheel-ground FrictionJoint's resistance in sync with the
        // held state on every frame (including the grab/release transition
        // frames), since it's a persistent constraint that keeps applying
        // even while the early return below skips manual force application.
        if (this.bot.held !== this.wasHeld) {
            this.wasHeld = this.bot.held
            if (this.frictionJoint) {
                if (this.bot.held) {
                    this.frictionJoint.setMaxForce(0)
                    this.frictionJoint.setMaxTorque(0)
                } else {
                    this.frictionJoint.setMaxForce(this.frictionJointStrength.maxForce)
                    this.frictionJoint.setMaxTorque(this.frictionJointStrength.maxTorque)
                }
            }
        }

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
