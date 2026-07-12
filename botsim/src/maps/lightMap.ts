import { MapSpec } from "./specs"
import { defaultDynamicPhysics, defaultShapePhysics, defaultColorBrush } from "../sim/specs"
import { MAP_ASPECT_RATIO, MICROBIT_COLORS } from "../constants"

const ARENA = 90   // cm
const CENTER_X = ARENA / 2
const CENTER_Y = ARENA / MAP_ASPECT_RATIO / 2

// Open arena with a single draggable light source — no follow-line track, no
// obstacles — for validating follow-light seek behavior in the simulator.
export const LIGHT_MAP: MapSpec = {
    id: 3,
    name: "Luz",
    width: ARENA,
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#E7E9E7",
    showLightCone: true,
    spawns: [
        { pos: { x: CENTER_X, y: CENTER_Y + 20 }, angle: 0 },
    ],
    entities: [
        // Light source — draggable, dynamic physics so it can be pushed/
        // dragged around the arena like the default map's obstacle boxes.
        // The collider stays an invisible box (light-source detection in
        // lightSensor.ts only understands polygon-shaped fixtures) while a
        // circular bulb + radial-gradient halo provide the visible look.
        {
            label: "light-source-1",
            pos: { x: CENTER_X, y: CENTER_Y - 20 },
            angle: 0,
            physics: { ...defaultDynamicPhysics(), linearDamping: 10, angularDamping: 10 },
            shapes: [
                {
                    type: "box",
                    roles: ["light-source", "mouse-target"],
                    size: { x: 8, y: 8 },
                    halign: "center",
                    valign: "center",
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    physics: { ...defaultShapePhysics(), friction: 0.1, restitution: 0.5, density: 3 },
                    brush: { ...defaultColorBrush(), visible: false },
                },
                {
                    type: "circle",
                    roles: [],
                    radius: 16,
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                    brush: { ...defaultColorBrush(), fillColor: MICROBIT_COLORS.YELLOW, glow: true, visible: true, zIndex: 0 },
                },
                {
                    type: "circle",
                    roles: [],
                    radius: 4,
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                    brush: { ...defaultColorBrush(), fillColor: MICROBIT_COLORS.YELLOW, borderColor: "#444444", borderWidth: 0.25, visible: true, zIndex: 2 },
                },
            ],
        },
    ],
}
