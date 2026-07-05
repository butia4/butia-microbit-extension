import { describe, it, expect } from "vitest"
import { Chassis } from "./chassis"
import { BotSpec } from "../../bots/specs"

const baseSpec: Omit<BotSpec, "chassis"> = {
    name: "TestBot",
    mass: 500,
    wheels: [],
    connectors: [],
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
})
