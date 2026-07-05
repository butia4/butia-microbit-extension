import { BotSpec } from "../../bots/specs"
import { BrushSpec, EntityShapeSpec, defaultEntityShape, defaultBoxShape, defaultCircleShape, defaultColorBrush, defaultTextureBrush, defaultShapePhysics } from "../specs"

export class Chassis {
    public static makeShapeSpec(spec: BotSpec): EntityShapeSpec {
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
                physics: { ...defaultShapePhysics(), density: spec.mass / (Math.PI * spec.chassis.radius * spec.chassis.radius), friction: 0.2, restitution: 0.2 },
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
            physics: { ...defaultShapePhysics(), density: spec.mass / (spec.chassis.size.x * spec.chassis.size.y), friction: 0.2, restitution: 0.2 },
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
