import { BotSpec, SquareChassisSpec } from "../../botSpecs/botSpec"
import { BUTIA_CHASSIS_COLORS } from "../../botSpecs/butiaBotSpec"
import { BrushSpec, EntityShapeSpec, defaultEntityShape, defaultBoxShape, defaultCircleShape, defaultPolygonShape, defaultColorBrush, defaultTextureBrush, defaultShapePhysics } from "../entitySpec"
import { Vec2Like } from "../../shared/types/vec2"
import { WHEEL_DENSITY } from "./wheel"

const MIN_CHASSIS_MASS = 1 // grams; keeps density positive if wheels alone exceed spec.mass

export class Chassis {
    private static totalWheelMass(spec: BotSpec): number {
        return spec.wheels.reduce((sum, w) => sum + w.width * (w.radius * 2) * WHEEL_DENSITY, 0)
    }

    public static makeShapeSpec(spec: BotSpec): EntityShapeSpec {
        const chassisMass = Math.max(MIN_CHASSIS_MASS, spec.mass - Chassis.totalWheelMass(spec))
        const colorBrush: BrushSpec = {
            ...defaultColorBrush(),
            fillColor: BUTIA_CHASSIS_COLORS.fill, borderColor: BUTIA_CHASSIS_COLORS.border, borderWidth: 0.3, zIndex: 2,
        }
        const textureBrush: BrushSpec = {
            ...defaultTextureBrush(),
            texture: spec.chassis.texture ?? "placeholder.png",
            color: "#FFFFFF", alpha: 1, zIndex: 2,
        }
        const brush = spec.chassis.texture ? textureBrush : colorBrush

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

        if (spec.chassis.shape === "square") {
            const squareChassis = spec.chassis as SquareChassisSpec
            // collider stays a sharp 4-vertex square; only the visuals are chamfered
            const half = squareChassis.side / 2
            const verts: Vec2Like[] = [
                { x: -half, y: -half }, { x: half, y: -half },
                { x: half, y: half }, { x: -half, y: half },
            ]
            const area = squareChassis.side * squareChassis.side
            return {
                ...defaultEntityShape(),
                ...defaultPolygonShape(),
                label: "chassis",
                roles: ["mouse-target", "robot"],
                offset: { x: 0, y: 0 },
                verts,
                physics: { ...defaultShapePhysics(), density: chassisMass / area, friction: 0.2, restitution: 0.2 },
                brush: spec.chassis.texture ? textureBrush : { ...colorBrush, cornerRadius: squareChassis.cornerRadius },
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

    public static footprintWidth(spec: BotSpec): number {
        if (spec.chassis.shape === "circle") {
            return spec.chassis.radius * 2
        }

        if (spec.chassis.shape === "square") {
            return (spec.chassis as SquareChassisSpec).side
        }

        return spec.chassis.size.x
    }

    constructor(_bot: unknown, _spec: BotSpec["chassis"]) {}
    public destroy(): void {}
    public update(_dt: number): void {}
}
