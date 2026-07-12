import { describe, it, expect } from "vitest"
import { intersection, LineSegment } from "./line"

describe("intersection", () => {
    it("returns a point when two segments cross", () => {
        const result = intersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 })
        expect(result.type).toBe("point")
        if (result.type === "point") {
            expect(result.p.x).toBeCloseTo(5)
            expect(result.p.y).toBeCloseTo(5)
        }
    })

    it("returns none when segments don't overlap within their bounds", () => {
        // Same line as a crossing pair, but shifted so the segments never
        // reach each other's span.
        const result = intersection({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 5, y: 0 }, { x: 6, y: -1 })
        expect(result.type).toBe("none")
    })

    it("returns parallel for non-colinear parallel segments", () => {
        const result = intersection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: 10, y: 5 })
        expect(result.type).toBe("parallel")
    })

    it("returns colinear for overlapping segments on the same line", () => {
        const result = intersection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 0 }, { x: 15, y: 0 })
        expect(result.type).toBe("colinear")
    })

    it("returns colinear for segments on the same line that don't overlap", () => {
        const result = intersection({ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }, { x: 15, y: 0 })
        expect(result.type).toBe("colinear")
    })
})

describe("LineSegment", () => {
    it("like builds a plain LineSegmentLike from two points", () => {
        expect(LineSegment.like({ x: 0, y: 0 }, { x: 1, y: 1 })).toEqual({ p0: { x: 0, y: 0 }, p1: { x: 1, y: 1 } })
    })

    it("intersection delegates to the intersection() function on the segment endpoints", () => {
        const a = LineSegment.like({ x: 0, y: 0 }, { x: 10, y: 10 })
        const b = LineSegment.like({ x: 0, y: 10 }, { x: 10, y: 0 })
        const result = LineSegment.intersection(a, b)
        expect(result.type).toBe("point")
    })

    it("intersectionAll maps intersection() across a list of segments", () => {
        const l = LineSegment.like({ x: 0, y: 0 }, { x: 10, y: 10 })
        const others = [
            LineSegment.like({ x: 0, y: 10 }, { x: 10, y: 0 }), // crosses -> point
            LineSegment.like({ x: 0, y: 5 }, { x: 10, y: 5 }), // parallel? actually crosses diagonal too
        ]
        const results = LineSegment.intersectionAll(l, others)
        expect(results).toHaveLength(2)
        expect(results[0].type).toBe("point")
    })

    it("transformDeg rotates and translates both endpoints by the same pivot/angle", () => {
        const seg = LineSegment.like({ x: 1, y: 0 }, { x: 2, y: 0 })
        const result = LineSegment.transformDeg(seg, { x: 10, y: 10 }, 90)
        expect(result.p0.x).toBeCloseTo(10)
        expect(result.p0.y).toBeCloseTo(11)
        expect(result.p1.x).toBeCloseTo(10)
        expect(result.p1.y).toBeCloseTo(12)
    })
})
