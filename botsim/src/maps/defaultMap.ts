import { MapSpec } from "./specs"
import { defaultStaticPhysics, defaultDynamicPhysics, defaultShapePhysics, defaultColorBrush } from "../sim/specs"
import { pickRandom } from "../util"
import { MAP_ASPECT_RATIO, MICROBIT_COLORS } from "../constants"

const ARENA = 90   // cm
const CENTER_X = ARENA / 2
const CENTER_Y = ARENA / MAP_ASPECT_RATIO / 2

// Closed line-following track path
const TRACK_VERTS = [
    { x: 10,          y: ARENA / MAP_ASPECT_RATIO / 2 + 8 },
    { x: 10,          y: ARENA / MAP_ASPECT_RATIO / 2 - 8 },
    { x: 20,          y: 19 },
    { x: ARENA / 2,   y: 22 },
    { x: ARENA - 20,  y: 19 },
    { x: ARENA - 10,  y: ARENA / MAP_ASPECT_RATIO / 2 - 8 },
    { x: ARENA - 10,  y: ARENA / MAP_ASPECT_RATIO / 2 + 8 },
    { x: ARENA - 20,  y: ARENA / MAP_ASPECT_RATIO - 19 },
    { x: ARENA / 2,   y: ARENA / MAP_ASPECT_RATIO - 22 },
    { x: 20,          y: ARENA / MAP_ASPECT_RATIO - 19 },
]

export const DEFAULT_MAP: MapSpec = {
    name: "Default",
    width: ARENA,
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#E7E9E7",
    spawns: [
        { pos: { x: CENTER_X, y: CENTER_Y - 20 }, angle: 0 },
    ],
    entities: [
        // Follow-line closed track path
        {
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [{
                type: "path",
                roles: ["follow-line"],
                verts: TRACK_VERTS,
                width: 3,
                closed: true,
                stepSize: 0.5,
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                brush: { ...defaultColorBrush(), fillColor: "#1a1a1a", borderColor: "#1a1a1a", borderWidth: 0, visible: true, zIndex: 0 },
            }],
        },
        // Obstacle box 1 — draggable, randomly colored
        {
            label: "obstacle-1",
            pos: { x: CENTER_X - 10, y: CENTER_Y },
            angle: 0,
            physics: { ...defaultDynamicPhysics(), linearDamping: 10, angularDamping: 10 },
            shapes: [{
                type: "box",
                roles: ["obstacle", "mouse-target"],
                size: { x: 8, y: 8 },
                halign: "center",
                valign: "center",
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), friction: 0.1, restitution: 0.5, density: 3 },
                brush: { ...defaultColorBrush(), fillColor: pickRandom(Object.values(MICROBIT_COLORS)), borderColor: "#444444", borderWidth: 0.25, visible: true, zIndex: 1 },
            }],
        },
        // Obstacle box 2 — draggable, randomly colored
        {
            label: "obstacle-2",
            pos: { x: CENTER_X + 10, y: CENTER_Y },
            angle: 45,
            physics: { ...defaultDynamicPhysics(), linearDamping: 10, angularDamping: 10 },
            shapes: [{
                type: "box",
                roles: ["obstacle", "mouse-target"],
                size: { x: 8, y: 8 },
                halign: "center",
                valign: "center",
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), friction: 0.1, restitution: 0.5, density: 3 },
                brush: { ...defaultColorBrush(), fillColor: pickRandom(Object.values(MICROBIT_COLORS)), borderColor: "#444444", borderWidth: 0.25, visible: true, zIndex: 1 },
            }],
        },
    ],
}
