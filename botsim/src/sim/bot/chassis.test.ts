import { describe, it, expect } from "vitest"
import { Chassis } from "./chassis"
import { BotSpec } from "../../bots/specs"

const baseSpec: Omit<BotSpec, "chassis"> = {
    name: "TestBot",
    mass: 500,
    wheels: [],
    sensorMounts: {
        left: { pos: { x: -3, y: -5 } },
        right: { pos: { x: 3, y: -5 } },
    },
}

describe("Chassis.makeShapeSpec", () => {
    it("builds a circle shape spec with radius, density and brush colors", () => {
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "circle", radius: 5 },
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)

        expect(shapeSpec.type).toBe("circle")
        expect((shapeSpec as { radius: number }).radius).toBe(5)
        expect(shapeSpec.physics.density).toBeCloseTo(500 / (Math.PI * 5 * 5))
        expect(shapeSpec.brush).toMatchObject({
            type: "color",
            fillColor: "#11B5E4",
            borderColor: "#555555",
        })
    })

    it("still builds a box shape spec for legacy box chassis specs", () => {
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "box", size: { x: 20, y: 15 } },
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)

        expect(shapeSpec.type).toBe("box")
        expect((shapeSpec as { size: { x: number; y: number } }).size).toEqual({ x: 20, y: 15 })
        expect(shapeSpec.physics.density).toBeCloseTo(500 / (20 * 15))
    })

    it("subtracts wheel mass from chassis mass so total body mass equals spec.mass", () => {
        // Two wheels: width 2, radius 3.25 (diameter 6.5) each, density 10
        // (WHEEL_DENSITY in wheel.ts) -> area 2*6.5=13 cm^2 -> mass 130g each,
        // 260g total. Chassis should absorb only the remaining 240g.
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "circle", radius: 5 },
            wheels: [
                { name: "left", maxSpeed: 100, dashTime: 0.5, pos: { x: -8, y: 2 }, width: 2, radius: 3.25 },
                { name: "right", maxSpeed: 100, dashTime: 0.5, pos: { x: 8, y: 2 }, width: 2, radius: 3.25 },
            ],
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)
        const chassisArea = Math.PI * 5 * 5
        const expectedChassisMass = 500 - 2 * (2 * 6.5 * 10)

        expect(shapeSpec.physics.density).toBeCloseTo(expectedChassisMass / chassisArea)
        // Sanity: chassis mass + wheel mass reconstructs spec.mass.
        expect(shapeSpec.physics.density * chassisArea + 2 * (2 * 6.5 * 10)).toBeCloseTo(500)
    })

    it("builds an 8-vert rounded-square polygon shape spec, capped at Physics' polygon vertex limit", () => {
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "square", side: 10, cornerRadius: 1.2 },
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)

        expect(shapeSpec.type).toBe("polygon")
        const verts = (shapeSpec as { verts: { x: number; y: number }[] }).verts
        expect(verts).toHaveLength(8)
    })

    it("generates a convex rounded-square polygon with no vertex outside the outer square bounds (no truncation)", () => {
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "square", side: 10, cornerRadius: 1.2 },
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)
        const verts = (shapeSpec as { verts: { x: number; y: number }[] }).verts

        const half = 5
        for (const v of verts) {
            expect(Math.abs(v.x)).toBeLessThanOrEqual(half + 1e-9)
            expect(Math.abs(v.y)).toBeLessThanOrEqual(half + 1e-9)
        }

        // Convexity: cross product of consecutive edges keeps a consistent
        // sign all the way around (verts are generated in a single rotational
        // order — see roundedSquareVerts).
        const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
            (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
        const signs = verts.map((_, i) =>
            Math.sign(cross(verts[i], verts[(i + 1) % verts.length], verts[(i + 2) % verts.length]))
        ).filter(s => s !== 0)
        expect(new Set(signs).size).toBe(1)
    })

    it("computes chassis density from the shoelace area of the generated rounded-square verts", () => {
        const spec: BotSpec = {
            ...baseSpec,
            chassis: { shape: "square", side: 10, cornerRadius: 1.2 },
        }

        const shapeSpec = Chassis.makeShapeSpec(spec)
        const verts = (shapeSpec as { verts: { x: number; y: number }[] }).verts

        // Shoelace area of the returned verts, computed independently here.
        let sum = 0
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i]
            const b = verts[(i + 1) % verts.length]
            sum += a.x * b.y - b.x * a.y
        }
        const area = Math.abs(sum) / 2

        expect(shapeSpec.physics.density).toBeCloseTo(500 / area)
    })
})
