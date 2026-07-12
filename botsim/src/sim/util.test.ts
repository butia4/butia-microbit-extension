import { describe, it, expect, vi } from "vitest"

vi.mock("planck", () => ({
    internal: {
        Distance: {
            testOverlap: vi.fn(() => true),
        },
    },
}))

import * as Planck from "planck"
import {
    toRenderScale, boxToVertices, catmullRom, samplePath, appoximateArc,
    pointInPolygon, testOverlap, calcUvs, flattenVerts, expandMesh,
    numberToRgb, rgbToString, rgbToFloatArray,
} from "./util"
import { defaultBoxShape } from "./entitySpec"
import { RENDER_SCALE } from "../constants"

describe("toRenderScale", () => {
    it("scales cm to pixels using RENDER_SCALE", () => {
        expect(toRenderScale(10)).toBe(10 * RENDER_SCALE)
    })
})

describe("boxToVertices", () => {
    it("builds 4 corner vertices centered on the box's own origin", () => {
        const box = { ...defaultBoxShape(), size: { x: 4, y: 2 } }
        expect(boxToVertices(box)).toEqual([
            { x: -2, y: -1 },
            { x: 2, y: -1 },
            { x: 2, y: 1 },
            { x: -2, y: 1 },
        ])
    })
})

describe("catmullRom", () => {
    it("returns zero vector for an empty control-point list", () => {
        expect(catmullRom([], false, 0)).toEqual({ x: 0, y: 0 })
    })

    it("passes exactly through a control point when t lands on its index (open path)", () => {
        const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 10 }, { x: 30, y: 10 }]
        const p = catmullRom(pts, false, 1)
        expect(p.x).toBeCloseTo(10)
        expect(p.y).toBeCloseTo(0)
    })

    it("wraps around for a closed path", () => {
        const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
        const p = catmullRom(pts, true, 0)
        expect(p.x).toBeCloseTo(0)
        expect(p.y).toBeCloseTo(0)
    })
})

describe("samplePath", () => {
    it("returns the input unchanged when fewer than 2 vertices are given", () => {
        const verts = [{ x: 1, y: 1 }]
        expect(samplePath(verts, false, 4)).toBe(verts)
    })

    it("samples at least 2 points along an open path", () => {
        const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }]
        const result = samplePath(verts, false, 1)
        expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it("samples a closed path without throwing", () => {
        const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
        const result = samplePath(verts, true, 2)
        expect(result.length).toBeGreaterThan(0)
    })
})

describe("appoximateArc", () => {
    it("approximates a quarter circle with the requested number of segments", () => {
        const arc = appoximateArc({ x: 0, y: 0 }, 10, 0, 90, 4)
        expect(arc).toHaveLength(5) // segments + 1 points
        expect(arc[0].x).toBeCloseTo(10)
        expect(arc[0].y).toBeCloseTo(0)
        expect(arc[arc.length - 1].x).toBeCloseTo(0)
        expect(arc[arc.length - 1].y).toBeCloseTo(10)
    })
})

describe("pointInPolygon", () => {
    const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]

    it("returns true for a point inside the polygon", () => {
        expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    })

    it("returns false for a point outside the polygon", () => {
        expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false)
    })
})

describe("testOverlap", () => {
    it("delegates to Planck's internal Distance.testOverlap with the fixtures' shapes and transforms", () => {
        const fixtureA = {
            getShape: () => ({ shape: "A" }),
            getBody: () => ({ getTransform: () => ({ p: { x: 0, y: 0 }, q: { c: 1, s: 0 } }) }),
        } as unknown as import("planck").Fixture
        const fixtureB = {
            getShape: () => ({ shape: "B" }),
            getBody: () => ({ getTransform: () => ({ p: { x: 1, y: 1 }, q: { c: 1, s: 0 } }) }),
        } as unknown as import("planck").Fixture

        expect(testOverlap(fixtureA, fixtureB)).toBe(true)
        expect(Planck.internal.Distance.testOverlap).toHaveBeenCalledWith(
            { shape: "A" }, 0,
            { shape: "B" }, 0,
            { p: { x: 0, y: 0 }, q: { c: 1, s: 0 } },
            { p: { x: 1, y: 1 }, q: { c: 1, s: 0 } }
        )
    })
})

describe("calcUvs", () => {
    it("maps vertices to 0..1 UV space relative to their own bounding box", () => {
        const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
        expect(calcUvs(verts)).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
        ])
    })

    it("falls back to a 1-unit box to avoid division by zero for degenerate input", () => {
        const verts = [{ x: 5, y: 5 }]
        expect(calcUvs(verts)).toEqual([{ x: 0, y: 0 }])
    })
})

describe("flattenVerts", () => {
    it("flattens Vec2Like[] into an alternating [x, y, x, y, ...] array", () => {
        expect(flattenVerts([{ x: 1, y: 2 }, { x: 3, y: 4 }])).toEqual([1, 2, 3, 4])
    })
})

describe("expandMesh", () => {
    it("maps index-buffer entries back to their vertex", () => {
        const verts = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]
        expect(expandMesh(verts, [2, 0, 1])).toEqual([{ x: 2, y: 2 }, { x: 0, y: 0 }, { x: 1, y: 1 }])
    })
})

describe("color helpers", () => {
    it("numberToRgb extracts r/g/b bytes from a packed hex number", () => {
        expect(numberToRgb(0xff0080)).toEqual({ r: 255, g: 0, b: 128 })
    })

    it("rgbToString formats as a lowercase zero-padded hex color", () => {
        expect(rgbToString({ r: 255, g: 0, b: 8 })).toBe("#ff0008")
    })

    it("rgbToFloatArray normalizes bytes to the 0..1 range", () => {
        const [r, g, b] = rgbToFloatArray({ r: 255, g: 0, b: 128 })
        expect(r).toBeCloseTo(1)
        expect(g).toBeCloseTo(0)
        expect(b).toBeCloseTo(128 / 255)
    })

    it("numberToRgb and rgbToString round-trip a color", () => {
        expect(rgbToString(numberToRgb(0x11b5e4))).toBe("#11b5e4")
    })
})
