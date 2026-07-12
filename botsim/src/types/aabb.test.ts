import { describe, it, expect } from "vitest"
import { AABB } from "./aabb"

describe("AABB.like", () => {
    it("wraps min/max into a plain AABBLike", () => {
        expect(AABB.like({ x: 0, y: 0 }, { x: 5, y: 5 })).toEqual({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } })
    })
})

describe("AABB.from", () => {
    it("returns a zero-sized box at origin for an empty vertex list", () => {
        expect(AABB.from([])).toEqual({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } })
    })

    it("computes the bounding box of a set of vertices", () => {
        const aabb = AABB.from([{ x: -2, y: 3 }, { x: 5, y: -1 }, { x: 0, y: 0 }])
        expect(aabb).toEqual({ min: { x: -2, y: -1 }, max: { x: 5, y: 3 } })
    })

    it("degenerates to a point for a single vertex", () => {
        expect(AABB.from([{ x: 4, y: 4 }])).toEqual({ min: { x: 4, y: 4 }, max: { x: 4, y: 4 } })
    })
})

describe("AABB.width / AABB.height", () => {
    it("computes width and height from min/max", () => {
        const aabb = AABB.like({ x: -2, y: -1 }, { x: 5, y: 3 })
        expect(AABB.width(aabb)).toBe(7)
        expect(AABB.height(aabb)).toBe(4)
    })

    it("returns 0 for a degenerate (point) box", () => {
        const aabb = AABB.like({ x: 4, y: 4 }, { x: 4, y: 4 })
        expect(AABB.width(aabb)).toBe(0)
        expect(AABB.height(aabb)).toBe(0)
    })
})
