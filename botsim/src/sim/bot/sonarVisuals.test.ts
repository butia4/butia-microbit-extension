import { describe, it, expect } from "vitest"

function makeMockRenderObj() {
    const shapes = new Map<string, { visible: boolean; position: { set: (x: number, y: number) => void } }>()
    const renderObj = {
        addShape: (label: string, gfx: unknown) => shapes.set(label, gfx as { visible: boolean; position: { set: (x: number, y: number) => void } }),
        shapes,
    }
    return { renderObj, shapes }
}

const colors = { wave: { r: 0x10, g: 0x20, b: 0x30 }, ping: { r: 0x40, g: 0x50, b: 0x60 } }

describe("sonarVisuals", () => {
    describe("buildSonarVisuals", () => {
        it("early-returns without error when renderObj is falsy", async () => {
            const { buildSonarVisuals } = await import("./sonarVisuals")
            expect(() => buildSonarVisuals(undefined, { x: 0, y: 0 }, 30, 400, "wave", "target", colors)).not.toThrow()
        })

        it("builds only the ping mesh, starting invisible, when showCone is omitted (default false)", async () => {
            const { buildSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()

            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "myWave", "myTarget", colors)

            expect(shapes.size).toBe(1)
            expect(shapes.get("myWave")).toBeUndefined()
            expect(shapes.get("myTarget")).toBeDefined()
            expect(shapes.get("myTarget")?.visible).toBe(false)
        })

        it("also builds a visible wave/cone mesh when showCone is true", async () => {
            const { buildSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()

            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "myWave", "myTarget", colors, true)

            expect(shapes.size).toBe(2)
            expect(shapes.get("myWave")).toBeDefined()
            expect(shapes.get("myWave")?.visible).toBe(true)
            expect(shapes.get("myTarget")).toBeDefined()
            expect(shapes.get("myTarget")?.visible).toBe(false)
        })
    })

    describe("updateSonarVisuals", () => {
        it("early-returns without error when shapes is undefined", async () => {
            const { updateSonarVisuals } = await import("./sonarVisuals")
            expect(() =>
                updateSonarVisuals(undefined, true, undefined, "target", { x: 0, y: 0 }, 0)
            ).not.toThrow()
        })

        it("hides the target when `used` but no `nearest`, regardless of the wave label", async () => {
            const { buildSonarVisuals, updateSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()
            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "wave", "target", colors)

            updateSonarVisuals(shapes as unknown as any, true, undefined, "target", { x: 0, y: 0 }, 0)
            expect(shapes.get("target")?.visible).toBe(false) // no nearest -> target hidden

            updateSonarVisuals(shapes as unknown as any, false, undefined, "target", { x: 0, y: 0 }, 0)
            expect(shapes.get("target")?.visible).toBe(false)
        })

        it("shows and positions the target when `used` and `nearest` are both set", async () => {
            const { buildSonarVisuals, updateSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()
            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "wave", "target", colors)

            let positioned: { x: number; y: number } | undefined
            const target = shapes.get("target")!
            target.position.set = (x: number, y: number) => { positioned = { x, y } }

            updateSonarVisuals(shapes as unknown as any, true, { x: 10, y: 10 }, "target", { x: 0, y: 0 }, 0)

            expect(target.visible).toBe(true)
            expect(positioned).toBeDefined()
        })
    })
})
