import { BotSpec, SquareChassisSpec } from "../../botSpecs/botSpec"
import { BrushSpec, EntityShapeSpec, defaultEntityShape, defaultBoxShape, defaultCircleShape, defaultPolygonShape, defaultColorBrush, defaultTextureBrush, defaultShapePhysics } from "../entitySpec"
import { Vec2Like } from "../../types/vec2"
import { appoximateArc } from "../util"
import { WHEEL_DENSITY } from "./wheel"

// Minimum chassis mass (grams) enforced when spec.wheels' own mass would
// otherwise consume all — or more than all — of spec.mass. Keeps chassis
// density strictly positive so physics doesn't break on a misconfigured spec.
const MIN_CHASSIS_MASS = 1

// Builds an 8-vertex rounded-square polygon approximation: 4 corners, each
// approximated by a single-segment arc (appoximateArc(..., 1) -> 2 points),
// for exactly 4*2=8 verts total. Capped at 8 on purpose — Physics.addShape's
// "polygon" case does `s.verts.slice(0, 8)`, silently dropping verts beyond
// index 8 for the physics fixture while the renderer would draw the full
// array; generating exactly 8 keeps the render mesh and the collider
// identical (faceted corners are the accepted final geometry, not a defect).
function roundedSquareVerts(side: number, cornerRadius: number): Vec2Like[] {
    const half = side / 2
    const inset = half - cornerRadius
    // Each corner: [signX, signY, startDeg, endDeg] — arc sweeps the outer
    // 90° of that corner's circle, going around the square in order.
    const corners: [number, number, number, number][] = [
        [ 1, -1, 270, 360], // top-right (front-right, y negative = front)
        [ 1,  1,   0,  90], // bottom-right
        [-1,  1,  90, 180], // bottom-left
        [-1, -1, 180, 270], // top-left (front-left)
    ]
    const verts: Vec2Like[] = []
    for (const [sx, sy, startDeg, endDeg] of corners) {
        const center = { x: sx * inset, y: sy * inset }
        verts.push(...appoximateArc(center, cornerRadius, startDeg, endDeg, 1))
    }
    return verts
}

// Shoelace formula — polygon area from its (ordered) vertices. Used to derive
// chassis density from spec.mass, consistent between the visual mesh and the
// physics fixture since both are built from the same 8-vert array.
function shoelaceArea(verts: Vec2Like[]): number {
    let sum = 0
    for (let i = 0; i < verts.length; i++) {
        const a = verts[i]
        const b = verts[(i + 1) % verts.length]
        sum += a.x * b.y - b.x * a.y
    }
    return Math.abs(sum) / 2
}

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

        if (spec.chassis.shape === "square") {
            const squareChassis = spec.chassis as SquareChassisSpec
            const verts = roundedSquareVerts(squareChassis.side, squareChassis.cornerRadius)
            const area = shoelaceArea(verts)
            return {
                ...defaultEntityShape(),
                ...defaultPolygonShape(),
                label: "chassis",
                roles: ["mouse-target", "robot"],
                offset: { x: 0, y: 0 },
                verts,
                physics: { ...defaultShapePhysics(), density: chassisMass / area, friction: 0.2, restitution: 0.2 },
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
