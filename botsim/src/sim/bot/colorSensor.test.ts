import { describe, it, expect, vi } from "vitest"

// Mock planck-js before importing ColorSensor
vi.mock("planck-js", () => ({
    default: {
        Circle: vi.fn(() => ({})),
        Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
    },
}))

function makeMockRenderObj() {
    const shapes = new Map<string, { visible: boolean; position: { set: (x: number, y: number) => void } }>()
    const renderObj = {
        addShape: (label: string, gfx: unknown) => shapes.set(label, gfx as { visible: boolean; position: { set: (x: number, y: number) => void } }),
        shapes,
    }
    return { renderObj, shapes }
}

describe("ColorSensor", () => {
    it("returns 0 when no contacts", async () => {
        const { ColorSensor } = await import("./colorSensor")
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

        const sensor = new ColorSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        const value = sensor.read()
        expect(value).toBe(0)
    })

    it("returns 1023 when contact with follow-line fixture", async () => {
        vi.resetModules()
        const { ColorSensor } = await import("./colorSensor")

        const followLineFixture = {
            getUserData: () => ({ roles: ["follow-line"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.color" }) }),
            getFixtureB: () => followLineFixture,
            next: null,
        }

        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => ({ getUserData: () => ({ label: "left.color" }) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const sensor = new ColorSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.color"
        const value = sensor.read()
        expect(value).toBe(1023)
    })

    it("detection is identical whether spec.angle is unset or explicitly set (visual-only field)", async () => {
        vi.resetModules()
        const { ColorSensor } = await import("./colorSensor")

        const followLineFixture = {
            getUserData: () => ({ roles: ["follow-line"] }),
        }
        const contact = {
            getFixtureA: () => ({ getUserData: () => ({ label: "left.color" }) }),
            getFixtureB: () => followLineFixture,
            next: null,
        }
        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => ({ getUserData: () => ({ label: "left.color" }) })),
                    },
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
        } as unknown as any

        const noAngleSensor = new ColorSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        ;(noAngleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.color"
        const angleSensor = new ColorSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left", angle: 45 })
        ;(angleSensor as unknown as { _fixtureLabel: string })._fixtureLabel = "left.color"

        expect(noAngleSensor.read()).toBe(angleSensor.read())
        expect(noAngleSensor.read()).toBe(1023)
    })

    it("always builds a beam mesh, using the default angle when spec.angle is unset", async () => {
        vi.resetModules()
        const { ColorSensor } = await import("./colorSensor")

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

        const sensor = new ColorSensor(mockBot, { pos: { x: 0, y: -5 }, name: "left" })
        expect(shapes.size).toBe(2) // wave + target meshes always built

        sensor.read()
        const waveLabel = [...shapes.keys()].find(k => k.startsWith("color.wave."))
        expect(waveLabel).toBeDefined()
        expect(shapes.get(waveLabel as string)?.visible).toBe(true) // used=true once read() runs, regardless of detection
    })
})
