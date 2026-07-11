import { BotSpec, toWheels } from "./specs"

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
    }),
    sensorMounts: {
        left:  { pos: { x: -3, y: -5 } },
        right: { pos: { x:  3, y: -5 } },
    },
}
