import { Vec2, Vec2Like } from "../../shared/types/vec2"
import { AABB } from "../../shared/types/aabb"
import { RENDER_SCALE } from "../../shared/constants"
import { BoxShapeSpec } from "../entitySpec"

export function toRenderScale(cm: number): number { return cm * RENDER_SCALE }

export function boxToVertices(box: BoxShapeSpec): Vec2Like[] {
    const hw = box.size.x / 2
    const hh = box.size.y / 2
    return [Vec2.like(-hw, -hh), Vec2.like(hw, -hh), Vec2.like(hw, hh), Vec2.like(-hw, hh)]
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
