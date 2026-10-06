import { MapSpec } from "./mapSpec"
import { defaultStaticPhysics, defaultShapePhysics, defaultColorBrush } from "../sim/entitySpec"
import { MAP_ASPECT_RATIO } from "../shared/constants"

const ARENA = 90   // cm
const CENTER_Y = ARENA / MAP_ASPECT_RATIO / 2

const START_X = 10
const FINISH_X = ARENA - 10
const MARKER_SIZE = 8 // cm, visual-only start/finish squares

// Regular S-curve from A (left) to B (right), built like a real track: every bend
// is an arc of the same radius joined to the next by straight lines, so curvature
// is constant along each bend. The lobes are symmetric above and below the centerline.
const TURN_RADIUS = 9            // cm
const TURN_ANGLE = Math.PI / 3   // heading change of the entry/exit bends; peak/trough bends turn twice this
const RISE = 4                   // cm, straight between the entry/exit bends and the peak/trough bends
const ARC_VERT_SPACING = 2       // cm between generated vertices along each arc

type TrackPiece = { turn: number } | { straight: number }

function trackPieces(): TrackPiece[] {
    const bendRise = TURN_RADIUS * (1 - Math.cos(TURN_ANGLE))
    // the middle straight descends exactly what the rest climbs, so B ends on the centerline
    const fall = (2 * bendRise) / Math.sin(TURN_ANGLE) + 2 * RISE
    return [
        { turn: -TURN_ANGLE }, { straight: RISE }, { turn: 2 * TURN_ANGLE },
        { straight: fall },
        { turn: -2 * TURN_ANGLE }, { straight: RISE }, { turn: TURN_ANGLE },
    ]
}

function trackVerts(): { x: number; y: number }[] {
    const pieces = trackPieces()
    const verts = [{ x: START_X, y: CENTER_Y }]
    let pos = { x: START_X, y: CENTER_Y }
    let heading = 0 // radians, 0 = +X; negative turns toward -Y (up on screen)
    const walk = (leadIn: number) => {
        pos = { x: START_X + leadIn, y: CENTER_Y }
        verts.length = 1
        verts.push({ ...pos })
        heading = 0
        for (const p of pieces) {
            if ("straight" in p) {
                // evenly spaced verts keep the spline from bowing the straight between bends
                const steps = Math.ceil(p.straight / ARC_VERT_SPACING)
                const start = pos
                for (let i = 1; i <= steps; i++) {
                    const d = (p.straight * i) / steps
                    verts.push({ x: start.x + d * Math.cos(heading), y: start.y + d * Math.sin(heading) })
                }
                pos = verts[verts.length - 1]
                continue
            }
            const dir = Math.sign(p.turn)
            const center = { x: pos.x - dir * TURN_RADIUS * Math.sin(heading), y: pos.y + dir * TURN_RADIUS * Math.cos(heading) }
            const steps = Math.ceil((Math.abs(p.turn) * TURN_RADIUS) / ARC_VERT_SPACING)
            for (let i = 1; i <= steps; i++) {
                const h = heading + (p.turn * i) / steps
                verts.push({ x: center.x + dir * TURN_RADIUS * Math.sin(h), y: center.y - dir * TURN_RADIUS * Math.cos(h) })
            }
            heading += p.turn
            pos = verts[verts.length - 1]
        }
    }
    walk(0)
    // center the curved section between A and B, with equal straight lead-ins
    walk((FINISH_X - pos.x) / 2)
    verts.push({ x: FINISH_X, y: CENTER_Y })
    return verts
}

function markerEntity(label: string, x: number, color: string): MapSpec["entities"][number] {
    return {
        label,
        pos: { x, y: CENTER_Y },
        angle: 0,
        physics: defaultStaticPhysics(),
        shapes: [{
            type: "box",
            roles: [], // purely visual: no sensor role, the robot ignores it
            size: { x: MARKER_SIZE, y: MARKER_SIZE },
            halign: "center",
            valign: "center",
            offset: { x: 0, y: 0 },
            angle: 0,
            physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
            brush: { ...defaultColorBrush(), fillColor: color, borderColor: color, borderWidth: 0, visible: true, zIndex: 0 },
        }],
    }
}

// id must stay in sync with the extension's ButiaSimMap.LineAToB (src/types/enums.d.ts).
export const LINE_A_TO_B_MAP: MapSpec = {
    id: 4,
    name: "Line A to B",
    width: ARENA,
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#E7E9E7",
    // Robot faces +X (angle 90) at point A, on the start of the line.
    spawns: [
        { pos: { x: START_X, y: CENTER_Y }, angle: 90 },
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
        markerEntity("start-a", START_X, "#9be39b"),
        markerEntity("finish-b", FINISH_X, "#f2a0a0"),
        {
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [{
                type: "path",
                roles: ["follow-line"],
                verts: trackVerts(),
                width: 2,
                closed: false,
                stepSize: 0.5,
                offset: { x: 0, y: 0 },
                angle: 0,
                physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
                brush: { ...defaultColorBrush(), fillColor: "#1a1a1a", borderColor: "#1a1a1a", borderWidth: 0, visible: true, zIndex: 1 },
            }],
        },
    ],
}
