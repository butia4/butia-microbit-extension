import { BotSpec, toWheels } from "./botSpec"

// Chassis fill/border colors, shared between the sim's Pixi rendering
// (Chassis.makeShapeSpec) and the PinSettings preview's SVG rendering
// (ChassisIllustration) so both draw the same chassis with a single source
// of truth instead of two independently hardcoded hex literals.
export const BUTIA_CHASSIS_COLORS = { fill: "#C3E8A8", border: "#555555" } as const

// Placeholder dimensions — update when Butia v4 schematic is confirmed.
// All geometry (chassis/wheels/sensorMounts) is scaled 0.8x from the
// original 10cm-side chassis so the bot reads smaller in the sim — keep
// every new measurement proportional to that same 0.8 factor if the spec
// changes again, or the sensor mounts will drift off the chassis edge.
export const BUTIA_BOT_SPEC: BotSpec = {
    name: "Butia",
    mass: 500, // grams
    chassis: {
        shape: "square",
        side: 8,          // cm
        cornerRadius: 0.96, // cm
    },
    wheels: toWheels({
        separation: 8,   // cm between inner wheel edges — placeholder
        diameter: 3.2,  // cm
        width: 0.96,    // cm
        y: 1.6,         // offset toward rear
        // Simulator-only speed cap — the requested speed (0-100 from blocks,
        // though nothing stops a higher value) is used as-is up to this
        // ceiling, then clamped. E.g. requesting 22 drives at 22; requesting
        // 26 drives at 25. Hardware is unaffected; this only clamps physics.
        maxSpeed: 25,
    }),
    // facingDeg follows Vec2.rotateDeg's clockwise-positive convention:
    // 0 = front (local -y), 90 = right, -90 = left, 180 = rear.
    sensorMounts: {
        frontLeft:  { pos: { x: -2.4, y: -4   }, facingDeg: 0 },
        frontRight: { pos: { x:  2.4, y: -4   }, facingDeg: 0 },
        sideLeft:   { pos: { x: -4,   y: -1.6 }, facingDeg: -90 }, // closer to front (y=-4) than rear (y=4)
        sideRight:  { pos: { x:  4,   y: -1.6 }, facingDeg: 90 },  // closer to front (y=-4) than rear (y=4)
        rearLeft:   { pos: { x: -2.4, y:  4   }, facingDeg: 180 },
        rearRight:  { pos: { x:  2.4, y:  4   }, facingDeg: 180 },
    },
}
