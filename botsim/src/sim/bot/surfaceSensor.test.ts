import { describe, it, expect, vi } from "vitest"

// Mock planck-js before importing SurfaceSensor
vi.mock("planck-js", () => ({
    default: {
        Circle: vi.fn(() => ({})),
        Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
    },
}))

function makeMockBot(angle: number, contactList: unknown, renderObj?: unknown) {
    return {
        entity: {
            physicsObj: {
                body: {
                    getContactList: () => contactList,
                    createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                },
            },
            renderObj,
        },
        pos: { x: 45, y: 45 },
        angle,
    } as unknown as any
}

function makeMockRenderObj() {
    const shapes = new Map<string, { visible: boolean; position: { set: (x: number, y: number) => void } }>()
    const renderObj = {
        addShape: (label: string, gfx: unknown) => shapes.set(label, gfx as { visible: boolean; position: { set: (x: number, y: number) => void } }),
        shapes,
    }
    return { renderObj, shapes }
}

describe("SurfaceSensor", () => {
    it("returns MAX_RANGE when no contacts (off-table)", async () => {
        const { SurfaceSensor } = await import("./surfaceSensor")
        const { MAX_RANGE } = await import("./rangeSensor")

        const mockBot = makeMockBot(0, null)
        const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        expect(sensor.read()).toBe(MAX_RANGE)
    })

    it("returns SURFACE_ON_VALUE when overlapping a table-surface fixture (on-table)", async () => {
        vi.resetModules()
        const { SurfaceSensor, SURFACE_ON_VALUE } = await import("./surfaceSensor")

        const tableFixture = {
            getUserData: () => ({ roles: ["table-surface"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.surface" }) }),
            getFixtureB: () => tableFixture,
            next: null,
        }

        const mockBot = makeMockBot(0, { contact, next: null })
        const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.surface"

        expect(sensor.read()).toBe(SURFACE_ON_VALUE)
    })

    it("is heading-independent: on-table reading is unchanged across headings", async () => {
        vi.resetModules()
        const { SurfaceSensor, SURFACE_ON_VALUE } = await import("./surfaceSensor")

        const tableFixture = {
            getUserData: () => ({ roles: ["table-surface"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.surface" }) }),
            getFixtureB: () => tableFixture,
            next: null,
        }

        for (const angle of [0, 45, 90, 180, 270]) {
            const mockBot = makeMockBot(angle, { contact, next: null })
            const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
            ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.surface"
            expect(sensor.read()).toBe(SURFACE_ON_VALUE)
        }
    })

    it("is heading-independent: off-table reading is unchanged across headings", async () => {
        vi.resetModules()
        const { SurfaceSensor } = await import("./surfaceSensor")
        const { MAX_RANGE } = await import("./rangeSensor")

        for (const angle of [0, 45, 90, 180, 270]) {
            const mockBot = makeMockBot(angle, null)
            const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
            expect(sensor.read()).toBe(MAX_RANGE)
        }
    })

    it("detection is identical whether spec.angle is unset or explicitly set (visual-only field)", async () => {
        vi.resetModules()
        const { SurfaceSensor, SURFACE_ON_VALUE } = await import("./surfaceSensor")

        const tableFixture = { getUserData: () => ({ roles: ["table-surface"] }) }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.surface" }) }),
            getFixtureB: () => tableFixture,
            next: null,
        }

        const mockBot = makeMockBot(0, { contact, next: null })
        const noAngleSensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        ;(noAngleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.surface"
        const angleSensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left", angle: 45 })
        ;(angleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.surface"

        expect(noAngleSensor.read()).toBe(angleSensor.read())
        expect(noAngleSensor.read()).toBe(SURFACE_ON_VALUE)
    })

    it("always builds a beam mesh, using the default angle when spec.angle is unset", async () => {
        vi.resetModules()
        const { SurfaceSensor } = await import("./surfaceSensor")

        const { renderObj, shapes } = makeMockRenderObj()
        const mockBot = makeMockBot(0, null, renderObj)

        const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        expect(shapes.size).toBe(2) // wave + target meshes always built

        sensor.read()
        const waveLabel = [...shapes.keys()].find(k => k.startsWith("surface.wave."))
        expect(waveLabel).toBeDefined()
        expect(shapes.get(waveLabel as string)?.visible).toBe(true) // used=true once read() runs, regardless of detection
    })
})
