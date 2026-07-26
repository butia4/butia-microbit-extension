import { BotSpec, toWheels } from "./botSpec"

export const BUTIA_CHASSIS_COLORS = { fill: "#C3E8A8", border: "#555555" } as const

// Placeholder dimensions; geometry is scaled 0.8x from the original 10cm-side chassis.
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
        maxSpeed: 25, // sim-only speed clamp; hardware unaffected
    }),
    // facingDeg: 0=front(-y), clockwise-positive (Vec2.rotateDeg convention)
    sensorMounts: {
        frontLeft:  { pos: { x: -2.4, y: -4   }, facingDeg: 0 },
        frontRight: { pos: { x:  2.4, y: -4   }, facingDeg: 0 },
        sideLeft:   { pos: { x: -4,   y: -1.6 }, facingDeg: -90 },
        sideRight:  { pos: { x:  4,   y: -1.6 }, facingDeg: 90 },
        rearLeft:   { pos: { x: -2.4, y:  4   }, facingDeg: 180 },
        rearRight:  { pos: { x:  2.4, y:  4   }, facingDeg: 180 },
    },
}
