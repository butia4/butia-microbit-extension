import { Vec2, Vec2Like } from "../types/vec2"
import { AABB } from "../types/aabb"
import { toRadians } from "../util"
import * as Planck from "planck"
import { RENDER_SCALE } from "../constants"
import { BoxShapeSpec } from "./specs"

export function toRenderScale(cm: number): number { return cm * RENDER_SCALE }

export function boxToVertices(box: BoxShapeSpec): Vec2Like[] {
    const hw = box.size.x / 2
    const hh = box.size.y / 2
    return [Vec2.like(-hw, -hh), Vec2.like(hw, -hh), Vec2.like(hw, hh), Vec2.like(-hw, hh)]
}

export function catmullRom(p: Vec2Like[], closed: boolean, t: number): Vec2Like {
    if (!p.length) return Vec2.zero()
    const n = closed ? p.length : p.length - 1
    let i0 = Math.floor(t)
    const frac = t - i0
    const idx = (i: number) => closed ? ((i % p.length) + p.length) % p.length : Math.max(0, Math.min(p.length - 1, i))
    const p0 = p[idx(i0 - 1)]
    const p1 = p[idx(i0)]
    const p2 = p[idx(i0 + 1)]
    const p3 = p[idx(i0 + 2)]
    void n
    const t2 = frac * frac
    const t3 = t2 * frac
    return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * frac + (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 + (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * frac + (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 + (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3),
    }
}

export function samplePath(verts: Vec2Like[], closed: boolean, stepSize: number): Vec2Like[] {
    if (verts.length < 2) return verts
    const n = closed ? verts.length : verts.length - 1
    const steps = Math.max(2, Math.ceil(n / stepSize))
    const result: Vec2Like[] = []
    for (let i = 0; i < steps; i++) {
        result.push(catmullRom(verts, closed, (i / steps) * n))
    }
    return result
}

export function appoximateArc(center: Vec2Like, radius: number, startDeg: number, endDeg: number, segments: number): Vec2Like[] {
    const result: Vec2Like[] = []
    const startRad = toRadians(startDeg)
    const endRad = toRadians(endDeg)
    for (let i = 0; i <= segments; i++) {
        const angle = startRad + (endRad - startRad) * (i / segments)
        result.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius })
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

// --- Mesh / UV helpers (texture + shader brush pipeline) ---

/**
 * Returns UV coordinates (0..1) for the given vertices, mapped against their
 * own bounding box.
 */
export function calcUvs(verts: Vec2Like[]): Vec2Like[] {
    const aabb = AABB.from(verts)
    const w = AABB.width(aabb) || 1
    const h = AABB.height(aabb) || 1
    return verts.map(v => Vec2.like((v.x - aabb.min.x) / w, (v.y - aabb.min.y) / h))
}

export function flattenVerts(verts: Vec2Like[]): number[] {
    const flat: number[] = []
    for (const v of verts) flat.push(v.x, v.y)
    return flat
}

export function expandMesh(verts: Vec2Like[], indices: number[]): Vec2Like[] {
    return indices.map(i => verts[i])
}

// --- Color helpers (hex <-> rgb <-> shader-friendly float arrays) ---

export type Rgb = { r: number; g: number; b: number }

export function numberToRgb(n: number): Rgb {
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

export function rgbToString(rgb: Rgb): string {
    return "#" + rgb.r.toString(16).padStart(2, "0") + rgb.g.toString(16).padStart(2, "0") + rgb.b.toString(16).padStart(2, "0")
}

export function rgbToFloatArray(rgb: Rgb): number[] {
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255]
}
