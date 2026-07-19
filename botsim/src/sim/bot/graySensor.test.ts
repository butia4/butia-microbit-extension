import { describe, it, expect, vi } from "vitest"

// Mock planck before importing GraySensor
vi.mock("planck", () => ({
    Circle: vi.fn(() => ({})),
    Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
}))

function makeMockRenderObj() {
    const shapes = new Map<string, { visible: boolean; position: { set: (x: number, y: number) => void } }>()
    const renderObj = {
        addShape: (label: string, gfx: unknown) => shapes.set(label, gfx as { visible: boolean; position: { set: (x: number, y: number) => void } }),
        shapes,
    }
    return { renderObj, shapes }
}

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

        const sensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "frontLeft" })
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
            getFixtureA: () => ({ getUserData: () => ({ label: "left.sensor" }), getBody: () => ({}) }),
            getFixtureB: () => followLineFixture,
            next: null,
        }

        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => ({ getUserData: () => ({ label: "left.sensor" }) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const sensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "frontLeft" })
        // Manually set the fixture label so contact matching works
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.sensor"
        const value = sensor.read()
        expect(value).toBe(1023)
    })

    it("detection is identical whether spec.angle is unset or explicitly set (visual-only field)", async () => {
        vi.resetModules()
        const { GraySensor } = await import("./graySensor")

        const followLineFixture = {
            getUserData: () => ({ roles: ["follow-line"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.sensor" }) }),
            getFixtureB: () => followLineFixture,
            next: null,
        }
        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => ({ getUserData: () => ({ label: "left.sensor" }) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const noAngleSensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "frontLeft" })
        ;(noAngleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.sensor"
        const angleSensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "frontLeft", angle: 45 })
        ;(angleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.sensor"

        expect(noAngleSensor.read()).toBe(angleSensor.read())
        expect(noAngleSensor.read()).toBe(1023)
    })

    it("always builds a beam mesh, using the default angle when spec.angle is unset", async () => {
        vi.resetModules()
        const { GraySensor } = await import("./graySensor")

        const { renderObj, shapes } = makeMockRenderObj()
        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => null,
                        createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                    },
                },
                renderObj,
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const sensor = new GraySensor(mockBot, { pos: { x: 0, y: -5 }, name: "frontLeft" })
        expect(shapes.size).toBe(1) // only the ping/target mesh is built — sonar wave/cone mesh is disabled

        sensor.read()
        const targetLabel = [...shapes.keys()].find(k => k.startsWith("gray.target."))
        expect(targetLabel).toBeDefined()
    })
})
