import { BotSpec, toWheels } from "./specs"

// Placeholder dimensions — update when Butia v4 schematic is confirmed
export const BUTIA_BOT_SPEC: BotSpec = {
    name: "Butia",
    mass: 500, // grams
    chassis: {
        shape: "circle",
        radius: 5, // cm
    },
    wheels: toWheels({
        separation: 14, // cm between inner wheel edges — placeholder
        diameter: 6.5,  // cm
        width: 2,       // cm
        y: 2,           // offset toward rear
    }),
    connectors: [
        { name: "J1", pos: { x: -8, y: -7.5 } },
        { name: "J2", pos: { x: -4, y: -7.5 } },
        { name: "J3", pos: { x:  0, y: -7.5 } },
        { name: "J4", pos: { x:  4, y: -7.5 } },
        { name: "J5", pos: { x:  8, y: -7.5 } },
    ],
}
