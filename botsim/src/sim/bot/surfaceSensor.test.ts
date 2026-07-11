import { describe, it, expect, vi } from "vitest"

// Mock planck-js before importing SurfaceSensor
vi.mock("planck-js", () => ({
    default: {
        Circle: vi.fn(() => ({})),
        Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
    },
}))

function makeMockBot(angle: number, contactList: unknown) {
    return {
        entity: {
            physicsObj: {
                body: {
                    getContactList: () => contactList,
                    createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                },
            },
        },
        pos: { x: 45, y: 45 },
        angle,
    } as unknown as any
}

describe("SurfaceSensor", () => {
    it("returns MAX_RANGE when no contacts (off-table)", async () => {
        const { SurfaceSensor } = await import("./surfaceSensor")
        const { MAX_RANGE } = await import("./rangeSensor")

        const mockBot = makeMockBot(0, null)
        const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "J1" })
        expect(sensor.read()).toBe(MAX_RANGE)
    })

    it("returns SURFACE_ON_VALUE when overlapping a table-surface fixture (on-table)", async () => {
        vi.resetModules()
        const { SurfaceSensor, SURFACE_ON_VALUE } = await import("./surfaceSensor")

        const tableFixture = {
            getUserData: () => ({ roles: ["table-surface"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "J1.surface" }) }),
            getFixtureB: () => tableFixture,
            next: null,
        }

        const mockBot = makeMockBot(0, { contact, next: null })
        const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "J1" })
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "J1.surface"

        expect(sensor.read()).toBe(SURFACE_ON_VALUE)
    })

    it("is heading-independent: on-table reading is unchanged across headings", async () => {
        vi.resetModules()
        const { SurfaceSensor, SURFACE_ON_VALUE } = await import("./surfaceSensor")

        const tableFixture = {
            getUserData: () => ({ roles: ["table-surface"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "J1.surface" }) }),
            getFixtureB: () => tableFixture,
            next: null,
        }

        for (const angle of [0, 45, 90, 180, 270]) {
            const mockBot = makeMockBot(angle, { contact, next: null })
            const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "J1" })
            ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "J1.surface"
            expect(sensor.read()).toBe(SURFACE_ON_VALUE)
        }
    })

    it("is heading-independent: off-table reading is unchanged across headings", async () => {
        vi.resetModules()
        const { SurfaceSensor } = await import("./surfaceSensor")
        const { MAX_RANGE } = await import("./rangeSensor")

        for (const angle of [0, 45, 90, 180, 270]) {
            const mockBot = makeMockBot(angle, null)
            const sensor = new SurfaceSensor(mockBot, { pos: { x: 0, y: -5 }, name: "J1" })
            expect(sensor.read()).toBe(MAX_RANGE)
        }
    })
})
