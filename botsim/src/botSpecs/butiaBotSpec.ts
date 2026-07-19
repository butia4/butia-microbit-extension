import { BotSpec, toWheels } from "./botSpec"

// Placeholder dimensions — update when Butia v4 schematic is confirmed
export const BUTIA_BOT_SPEC: BotSpec = {
    name: "Butia",
    mass: 500, // grams
    chassis: {
        shape: "square",
        side: 10,        // cm
        cornerRadius: 1.2, // cm
    },
    wheels: toWheels({
        separation: 10,  // cm between inner wheel edges — placeholder
        diameter: 4,    // cm
        width: 1.2,     // cm
        y: 2,           // offset toward rear
        // Simulator-only speed cap — the requested speed (0-100 from blocks,
        // though nothing stops a higher value) is used as-is up to this
        // ceiling, then clamped. E.g. requesting 22 drives at 22; requesting
        // 26 drives at 25. Hardware is unaffected; this only clamps physics.
        maxSpeed: 25,
    }),
    // facingDeg follows Vec2.rotateDeg's clockwise-positive convention:
    // 0 = front (local -y), 90 = right, -90 = left, 180 = rear.
    sensorMounts: {
        frontLeft:  { pos: { x: -3, y: -5 }, facingDeg: 0 },
        frontRight: { pos: { x:  3, y: -5 }, facingDeg: 0 },
        sideLeft:   { pos: { x: -5, y: -2 }, facingDeg: -90 }, // closer to front (y=-5) than rear (y=5)
        sideRight:  { pos: { x:  5, y: -2 }, facingDeg: 90 },  // closer to front (y=-5) than rear (y=5)
        rearLeft:   { pos: { x: -3, y:  5 }, facingDeg: 180 },
        rearRight:  { pos: { x:  3, y:  5 }, facingDeg: 180 },
    },
}
