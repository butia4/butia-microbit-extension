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

        it("builds both wave and ping meshes, both starting invisible", async () => {
            const { buildSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()

            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "myWave", "myTarget", colors)

            expect(shapes.size).toBe(2)
            expect(shapes.get("myWave")).toBeDefined()
            expect(shapes.get("myTarget")).toBeDefined()
            expect(shapes.get("myWave")?.visible).toBe(false)
            expect(shapes.get("myTarget")?.visible).toBe(false)
        })
    })

    describe("updateSonarVisuals", () => {
        it("early-returns without error when shapes is undefined", async () => {
            const { updateSonarVisuals } = await import("./sonarVisuals")
            expect(() =>
                updateSonarVisuals(undefined, true, undefined, "wave", "target", { x: 0, y: 0 }, 0)
            ).not.toThrow()
        })

        it("toggles wave visibility to match `used`, regardless of nearest", async () => {
            const { buildSonarVisuals, updateSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()
            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "wave", "target", colors)

            updateSonarVisuals(shapes as unknown as any, true, undefined, "wave", "target", { x: 0, y: 0 }, 0)
            expect(shapes.get("wave")?.visible).toBe(true)
            expect(shapes.get("target")?.visible).toBe(false) // no nearest -> target hidden

            updateSonarVisuals(shapes as unknown as any, false, undefined, "wave", "target", { x: 0, y: 0 }, 0)
            expect(shapes.get("wave")?.visible).toBe(false)
        })

        it("shows and positions the target when `used` and `nearest` are both set", async () => {
            const { buildSonarVisuals, updateSonarVisuals } = await import("./sonarVisuals")
            const { renderObj, shapes } = makeMockRenderObj()
            buildSonarVisuals(renderObj as unknown as any, { x: 0, y: -5 }, 70, 5, "wave", "target", colors)

            let positioned: { x: number; y: number } | undefined
            const target = shapes.get("target")!
            target.position.set = (x: number, y: number) => { positioned = { x, y } }

            updateSonarVisuals(shapes as unknown as any, true, { x: 10, y: 10 }, "wave", "target", { x: 0, y: 0 }, 0)

            expect(target.visible).toBe(true)
            expect(positioned).toBeDefined()
        })
    })
})
