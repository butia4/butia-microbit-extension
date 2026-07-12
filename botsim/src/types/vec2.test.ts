import { describe, it, expect } from "vitest"
import { Vec2 } from "./vec2"

describe("Vec2 factory helpers", () => {
    it("like/copy create independent plain objects", () => {
        const v = Vec2.like(1, 2)
        expect(v).toEqual({ x: 1, y: 2 })
        const c = Vec2.copy(v)
        expect(c).toEqual(v)
        expect(c).not.toBe(v)
    })

    it("areEqual compares by value", () => {
        expect(Vec2.areEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true)
        expect(Vec2.areEqual({ x: 1, y: 2 }, { x: 1, y: 3 })).toBe(false)
    })
})

describe("Vec2 arithmetic", () => {
    it("add/sub/mul/div operate component-wise", () => {
        expect(Vec2.add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 })
        expect(Vec2.sub({ x: 5, y: 5 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 4 })
        expect(Vec2.mul({ x: 2, y: 3 }, { x: 4, y: 5 })).toEqual({ x: 8, y: 15 })
        expect(Vec2.div({ x: 8, y: 9 }, { x: 2, y: 3 })).toEqual({ x: 4, y: 3 })
    })

    it("neg and scale", () => {
        expect(Vec2.neg({ x: 1, y: -2 })).toEqual({ x: -1, y: 2 })
        expect(Vec2.scale({ x: 1, y: -2 }, 3)).toEqual({ x: 3, y: -6 })
    })

    it("len/lenSq/dot/cross", () => {
        expect(Vec2.len({ x: 3, y: 4 })).toBe(5)
        expect(Vec2.lenSq({ x: 3, y: 4 })).toBe(25)
        expect(Vec2.dot({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11)
        expect(Vec2.cross({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    })
})

describe("Vec2.normalize", () => {
    it("normalizes a non-zero vector to unit length", () => {
        const n = Vec2.normalize({ x: 3, y: 4 })
        expect(n.x).toBeCloseTo(0.6)
        expect(n.y).toBeCloseTo(0.8)
    })

    it("returns the fallback for a zero vector when provided", () => {
        expect(Vec2.normalize({ x: 0, y: 0 }, { x: 1, y: 0 })).toEqual({ x: 1, y: 0 })
    })

    it("throws for a zero vector with no fallback", () => {
        expect(() => Vec2.normalize({ x: 0, y: 0 })).toThrow("Cannot normalize zero vector")
    })
})

describe("Vec2.perp", () => {
    it("rotates 90 degrees counter-clockwise (up=true)", () => {
        const p = Vec2.perp({ x: 1, y: 0 }, true)
        expect(p.x).toBeCloseTo(0)
        expect(p.y).toBe(1)
    })

    it("rotates 90 degrees clockwise (up=false)", () => {
        expect(Vec2.perp({ x: 1, y: 0 }, false)).toEqual({ x: 0, y: -1 })
    })
})

describe("Vec2 distance helpers", () => {
    it("dist/distSq measure separation between two points", () => {
        expect(Vec2.dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
        expect(Vec2.distSq({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25)
    })

    it("transpose swaps x/y and abs takes component-wise absolute value", () => {
        expect(Vec2.transpose({ x: 1, y: 2 })).toEqual({ x: 2, y: 1 })
        expect(Vec2.abs({ x: -1, y: -2 })).toEqual({ x: 1, y: 2 })
    })
})

describe("Vec2 angle helpers", () => {
    it("angle/angleDeg compute the direction of a vector", () => {
        expect(Vec2.angle({ x: 1, y: 0 })).toBeCloseTo(0)
        expect(Vec2.angleDeg({ x: 0, y: 1 })).toBeCloseTo(90)
    })

    it("fromAngle/fromAngleDeg build a unit vector from an angle", () => {
        const v = Vec2.fromAngleDeg(90)
        expect(v.x).toBeCloseTo(0)
        expect(v.y).toBeCloseTo(1)
    })
})

describe("Vec2 rotate/transform", () => {
    it("rotateDeg rotates a vector by degrees", () => {
        const r = Vec2.rotateDeg({ x: 1, y: 0 }, 90)
        expect(r.x).toBeCloseTo(0)
        expect(r.y).toBeCloseTo(1)
    })

    it("transformDeg rotates then translates by a pivot", () => {
        const t = Vec2.transformDeg({ x: 1, y: 0 }, { x: 10, y: 10 }, 90)
        expect(t.x).toBeCloseTo(10)
        expect(t.y).toBeCloseTo(11)
    })

    it("untransformDeg is the inverse of transformDeg", () => {
        const p = { x: 10, y: 10 }
        const original = { x: 1, y: 0 }
        const transformed = Vec2.transformDeg(original, p, 37)
        const back = Vec2.untransformDeg(transformed, p, 37)
        expect(back.x).toBeCloseTo(original.x)
        expect(back.y).toBeCloseTo(original.y)
    })
})

describe("Vec2 constants", () => {
    it("zero/one/up/down/left/right return their canonical values", () => {
        expect(Vec2.zero()).toEqual({ x: 0, y: 0 })
        expect(Vec2.one()).toEqual({ x: 1, y: 1 })
        expect(Vec2.up()).toEqual({ x: 0, y: -1 })
        expect(Vec2.down()).toEqual({ x: 0, y: 1 })
        expect(Vec2.left()).toEqual({ x: -1, y: 0 })
        expect(Vec2.right()).toEqual({ x: 1, y: 0 })
    })
})

describe("Vec2.lerp and Vec2.clamp", () => {
    it("lerp interpolates linearly between two points", () => {
        expect(Vec2.lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 })
        expect(Vec2.lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0)).toEqual({ x: 0, y: 0 })
        expect(Vec2.lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 1)).toEqual({ x: 10, y: 20 })
    })

    it("clamp restricts each component to the given min/max", () => {
        expect(Vec2.clamp({ x: -5, y: 15 }, { x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 0, y: 10 })
        expect(Vec2.clamp({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 5, y: 5 })
    })
})
