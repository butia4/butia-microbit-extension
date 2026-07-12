import { MapSpec } from "./mapSpec"
import { defaultShapePhysics, defaultColorBrush } from "../sim/entitySpec"
import { MAP_ASPECT_RATIO } from "../constants"

const ARENA = 90   // cm
const CENTER_X = ARENA / 2
const CENTER_Y = ARENA / MAP_ASPECT_RATIO / 2

const TABLE_WIDTH = 60  // cm
const TABLE_HEIGHT = 50 // cm

export const TABLE_MAP: MapSpec = {
    id: 2,
    name: "Mesa",
    width: ARENA,
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#2E2E2E",
    spawns: [
        { pos: { x: CENTER_X, y: CENTER_Y }, angle: 0 },
    ],
    entities: [
        // Tabletop — sensor-only (never a physical collider), so the robot
        // can drive off the edge and be detected losing the surface signal.
        {
            label: "table-surface",
            pos: { x: CENTER_X, y: CENTER_Y },
            angle: 0,
            physics: { type: "static", angularDamping: 0, linearDamping: 0 },
            shapes: [{
                type: "box",
                roles: ["table-surface"],
                size: { x: TABLE_WIDTH, y: TABLE_HEIGHT },
                halign: "center",
                valign: "center",
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                brush: { ...defaultColorBrush(), fillColor: "#C68642", borderColor: "#8B5A2B", borderWidth: 0.5, visible: true, zIndex: 0 },
            }],
        },
    ],
    sensorModes: { left: "surface", right: "surface" },
}
