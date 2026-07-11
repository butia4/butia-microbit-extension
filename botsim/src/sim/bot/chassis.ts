import { BotSpec } from "../../bots/specs"
import { BrushSpec, EntityShapeSpec, defaultEntityShape, defaultBoxShape, defaultCircleShape, defaultColorBrush, defaultTextureBrush, defaultShapePhysics } from "../specs"
import { WHEEL_DENSITY } from "./wheel"

// Minimum chassis mass (grams) enforced when spec.wheels' own mass would
// otherwise consume all — or more than all — of spec.mass. Keeps chassis
// density strictly positive so physics doesn't break on a misconfigured spec.
const MIN_CHASSIS_MASS = 1

export class Chassis {
    // Wheel fixtures are added to the same physics body as the chassis
    // (see Bot constructor: shapes: [chassisShape, ...wheelShapes]), and
    // Planck sums every fixture's density*area into the body's total mass.
    // So spec.mass is only "the whole robot's mass" if the chassis density
    // is computed net of the wheels' own contribution.
    private static totalWheelMass(spec: BotSpec): number {
        return spec.wheels.reduce((sum, w) => sum + w.width * (w.radius * 2) * WHEEL_DENSITY, 0)
    }

    public static makeShapeSpec(spec: BotSpec): EntityShapeSpec {
        const chassisMass = Math.max(MIN_CHASSIS_MASS, spec.mass - Chassis.totalWheelMass(spec))
        const colorBrush: BrushSpec = {
            ...defaultColorBrush(),
            fillColor: "#11B5E4", borderColor: "#555555", borderWidth: 0.3, zIndex: 2,
        }
        const textureBrush: BrushSpec = {
            ...defaultTextureBrush(),
            texture: spec.chassis.texture ?? "placeholder.png",
            color: "#FFFFFF", alpha: 1, zIndex: 2,
        }
        const brush = spec.chassis.texture ? textureBrush : colorBrush

        // Circular chassis — no `size` field, so density comes from the
        // circle-area formula instead of the box's width*height.
        if (spec.chassis.shape === "circle") {
            return {
                ...defaultEntityShape(),
                ...defaultCircleShape(),
                label: "chassis",
                roles: ["mouse-target", "robot"],
                offset: { x: 0, y: 0 },
                radius: spec.chassis.radius,
                physics: { ...defaultShapePhysics(), density: chassisMass / (Math.PI * spec.chassis.radius * spec.chassis.radius), friction: 0.2, restitution: 0.2 },
                brush,
            }
        }

        return {
            ...defaultEntityShape(),
            ...defaultBoxShape(),
            label: "chassis",
            roles: ["mouse-target", "robot"],
            offset: { x: 0, y: 0 },
            size: spec.chassis.size,
            physics: { ...defaultShapePhysics(), density: chassisMass / (spec.chassis.size.x * spec.chassis.size.y), friction: 0.2, restitution: 0.2 },
            brush,
        }
    }

    // LED color tint (Chassis.setColor) is out of scope for this iteration —
    // see tasks doc "Deferred / Out of Scope". bot/spec intentionally
    // discarded rather than stored as unused fields (strict noUnusedLocals).
    constructor(_bot: unknown, _spec: BotSpec["chassis"]) {}
    public destroy(): void {}
    public update(_dt: number): void {}
}
