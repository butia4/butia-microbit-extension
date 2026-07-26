import { Vec2, Vec2Like } from "./vec2"

export type LineSegmentLike = { p0: Vec2Like; p1: Vec2Like }

export type IntersectionResult =
    | { type: "none" }
    | { type: "parallel" }
    | { type: "colinear" }
    | { type: "point"; p: Vec2Like }

const EPSILON = 0.0001

export function intersection(p0: Vec2Like, p1: Vec2Like, p2: Vec2Like, p3: Vec2Like): IntersectionResult {
    const denom = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y)
    const numeA = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x)
    const numeB = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x)
    if (denom === 0) {
        return numeA === 0 && numeB === 0 ? { type: "colinear" } : { type: "parallel" }
    }
    const uA = numeA / denom
    const uB = numeB / denom
    if (uA >= -EPSILON && uA <= 1 + EPSILON && uB >= -EPSILON && uB <= 1 + EPSILON) {
        return { type: "point", p: { x: p0.x + uA * (p1.x - p0.x), y: p0.y + uA * (p1.y - p0.y) } }
    }
    return { type: "none" }
}

export class LineSegment implements LineSegmentLike {
    public p0 = Vec2.zero()
    public p1 = Vec2.zero()

    public static like(p0: Vec2Like, p1: Vec2Like): LineSegmentLike { return { p0, p1 } }

    public static intersection(l0: LineSegmentLike, l1: LineSegmentLike): IntersectionResult {
        return intersection(l0.p0, l0.p1, l1.p0, l1.p1)
    }

    public static intersectionAll(l: LineSegmentLike, ls: LineSegmentLike[]): IntersectionResult[] {
        return ls.map((l2) => LineSegment.intersection(l, l2))
    }

    public static transformDeg(l: LineSegmentLike, p: Vec2Like, angle: number): LineSegmentLike {
        return { p0: Vec2.transformDeg(l.p0, p, angle), p1: Vec2.transformDeg(l.p1, p, angle) }
    }
}
