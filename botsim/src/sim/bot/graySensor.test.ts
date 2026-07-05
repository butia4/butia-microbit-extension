import { describe, it, expect, vi } from "vitest"

// Mock planck-js before importing GraySensor
vi.mock("planck-js", () => ({
    default: {
        Circle: vi.fn(() => ({})),
        Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
    },
}))

describe("GraySensor", () => {
    it("returns 0 when no contacts", async () => {
        const { GraySensor } = await import("./graySensor")
        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => null,
                        createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const sensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "J2" })
        const value = sensor.read()
        expect(value).toBe(0)
    })

    it("returns 1023 when contact with follow-line fixture", async () => {
        vi.resetModules()
        const { GraySensor } = await import("./graySensor")

        const followLineFixture = {
            getUserData: () => ({ roles: ["follow-line"] }),
            getBody: () => ({ getAngle: () => 0, getPosition: () => ({ x: 0, y: 0 }) }),
            getShape: () => ({ getType: () => "circle" }),
        }

        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "J2.sensor" }), getBody: () => ({}) }),
            getFixtureB: () => followLineFixture,
            next: null,
        }

        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => ({ getUserData: () => ({ label: "J2.sensor" }) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const sensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "J2" })
        // Manually set the fixture label so contact matching works
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "J2.sensor"
        const value = sensor.read()
        expect(value).toBe(1023)
    })
})
