import { Vec2Like } from "../../shared/types/vec2"
import * as Planck from "planck"

const MIN_VERT_DISTANCE = 1e-6 // cm, consecutive vertices closer than this are merged
const DENSE_SUBDIVISIONS_PER_STEP = 4

function dist(a: Vec2Like, b: Vec2Like): number {
    return Math.hypot(b.x - a.x, b.y - a.y)
}

function mix(a: Vec2Like, b: Vec2Like, wa: number, wb: number): Vec2Like {
    return { x: wa * a.x + wb * b.x, y: wa * a.y + wb * b.y }
}

// Centripetal Catmull-Rom (alpha 0.5, Barry-Goldman form): point between p1 and p2 at u in [0, 1].
// No cusps or self-intersections, and it never overshoots on unevenly spaced vertices.
export function catmullRom(p0: Vec2Like, p1: Vec2Like, p2: Vec2Like, p3: Vec2Like, u: number): Vec2Like {
    const t0 = 0
    const t1 = t0 + Math.sqrt(Math.max(dist(p0, p1), MIN_VERT_DISTANCE))
    const t2 = t1 + Math.sqrt(Math.max(dist(p1, p2), MIN_VERT_DISTANCE))
    const t3 = t2 + Math.sqrt(Math.max(dist(p2, p3), MIN_VERT_DISTANCE))
    const t = t1 + (t2 - t1) * u
    const a1 = mix(p0, p1, (t1 - t) / (t1 - t0), (t - t0) / (t1 - t0))
    const a2 = mix(p1, p2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1))
    const a3 = mix(p2, p3, (t3 - t) / (t3 - t2), (t - t2) / (t3 - t2))
    const b1 = mix(a1, a2, (t2 - t) / (t2 - t0), (t - t0) / (t2 - t0))
    const b2 = mix(a2, a3, (t3 - t) / (t3 - t1), (t - t1) / (t3 - t1))
    return mix(b1, b2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1))
}

// stepCm: arc-length distance between consecutive output points, in cm.
// Open paths end exactly on the last vertex; closed paths do not repeat the first point at the seam.
export function samplePath(verts: Vec2Like[], closed: boolean, stepCm: number): Vec2Like[] {
    // drop consecutive duplicate vertices (and a closing duplicate of the first one)
    const v: Vec2Like[] = []
    for (const p of verts) {
        if (!v.length || dist(v[v.length - 1], p) > MIN_VERT_DISTANCE) v.push(p)
    }
    if (closed && v.length > 1 && dist(v[v.length - 1], v[0]) <= MIN_VERT_DISTANCE) v.pop()
    if (v.length < 2) return v

    const count = v.length
    const at = (i: number): Vec2Like => {
        if (closed) return v[((i % count) + count) % count]
        if (i < 0) return mix(v[0], v[1], 2, -1)
        if (i >= count) return mix(v[count - 1], v[count - 2], 2, -1)
        return v[i]
    }

    // dense pass: subdivide every segment finely enough that the polyline is a good arc-length proxy
    const dense: Vec2Like[] = []
    const segments = closed ? count : count - 1
    for (let i = 0; i < segments; i++) {
        const subs = Math.max(1, Math.ceil(dist(v[i], at(i + 1)) / (stepCm / DENSE_SUBDIVISIONS_PER_STEP)))
        for (let j = 0; j < subs; j++) {
            dense.push(catmullRom(at(i - 1), at(i), at(i + 1), at(i + 2), j / subs))
        }
    }
    if (!closed) dense.push(v[count - 1])

    // cumulative arc length (closed paths include the wrap-around segment)
    const cum: number[] = [0]
    const pts = closed ? [...dense, dense[0]] : dense
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]))
    const total = cum[cum.length - 1]

    const n = closed ? Math.max(3, Math.round(total / stepCm)) : Math.max(1, Math.ceil(total / stepCm))
    const result: Vec2Like[] = []
    let seg = 1
    const last = closed ? n - 1 : n
    for (let k = 0; k <= last; k++) {
        if (!closed && k === n) {
            result.push(v[count - 1])
            break
        }
        const target = (k * total) / n
        while (seg < cum.length - 1 && cum[seg] < target) seg++
        const span = cum[seg] - cum[seg - 1]
        const f = span > 0 ? (target - cum[seg - 1]) / span : 0
        result.push(mix(pts[seg - 1], pts[seg], 1 - f, f))
    }
    return result
}

export function pointInPolygon(p: Vec2Like, verts: Vec2Like[]): boolean {
    let inside = false
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
        const xi = verts[i].x, yi = verts[i].y
        const xj = verts[j].x, yj = verts[j].y
        const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

export function testOverlap(fixtureA: Planck.Fixture, fixtureB: Planck.Fixture): boolean {
    return Planck.internal.Distance.testOverlap(
        fixtureA.getShape(), 0,
        fixtureB.getShape(), 0,
        fixtureA.getBody().getTransform(),
        fixtureB.getBody().getTransform()
    )
}
