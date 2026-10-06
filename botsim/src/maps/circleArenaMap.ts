import { MapSpec } from "./mapSpec"
import { defaultStaticPhysics, defaultDynamicPhysics, defaultShapePhysics, defaultColorBrush } from "../sim/entitySpec"
import { pickRandom } from "../shared/util"
import { MAP_ASPECT_RATIO, MICROBIT_COLORS } from "../shared/constants"

const ARENA = 90   // cm
const CENTER_X = ARENA / 2
const CENTER_Y = ARENA / MAP_ASPECT_RATIO / 2

const RING_RADIUS = 30     // cm, centerline of the black ring
const RING_WIDTH = 2       // cm
const RING_VERTS = 64

function ringVerts(): { x: number; y: number }[] {
    const verts = []
    for (let i = 0; i < RING_VERTS; i++) {
        const theta = (i * 2 * Math.PI) / RING_VERTS
        verts.push({ x: RING_RADIUS * Math.cos(theta), y: RING_RADIUS * Math.sin(theta) })
    }
    return verts
}

// id must stay in sync with the extension's ButiaSimMap.CircleArena (src/types/enums.d.ts).
export const CIRCLE_ARENA_MAP: MapSpec = {
    id: 5,
    name: "Circle arena",
    width: ARENA,
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#F5F5F5",
    spawns: [
        { pos: { x: CENTER_X, y: CENTER_Y }, angle: 0 },
    ],
    defaultPinAssignment: {
        frontLeft: "J1",
        frontRight: "J2",
    },
    defaultSensorSettings: {
        frontLeft: { mode: "surface" },
        frontRight: { mode: "surface" },
    },
    entities: [
        {
            label: "ring",
            pos: { x: CENTER_X, y: CENTER_Y },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [{
                type: "path",
                roles: ["follow-line"],
                verts: ringVerts(),
                width: RING_WIDTH,
                closed: true,
                stepSize: 0.5,
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                brush: { ...defaultColorBrush(), fillColor: "#1a1a1a", borderColor: "#1a1a1a", borderWidth: 0, visible: true, zIndex: 0 },
            }],
        },
        {
            label: "object",
            pos: { x: CENTER_X, y: CENTER_Y - 15 }, // ahead of the robot (it faces -Y at angle 0)
            angle: 0,
            physics: { ...defaultDynamicPhysics(), linearDamping: 5, angularDamping: 5 },
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
