import { describe, it, expect, vi } from "vitest"

vi.mock("planck-js", () => ({
    default: {
        Polygon: vi.fn(() => ({})),
        Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
        Settings: { maxPolygonVertices: 64 },
        internal: {
            Distance: {
                testOverlap: vi.fn(() => true),
            },
        },
    },
}))

describe("RangeSensor", () => {
    it("returns MAX_RANGE when no obstacle contacts", async () => {
        const { RangeSensor, MAX_RANGE } = await import("./rangeSensor")

        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => null,
                        createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                    },
                    getWorldPoint: (p: { x: number; y: number }) => p,
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
            forward: { x: 0, y: -1 },
        } as unknown as any

        const sensor = new RangeSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "left", angle: 30, maxRange: MAX_RANGE })
        expect(sensor.read()).toBe(MAX_RANGE)
    })

    it("returns distance less than MAX_RANGE when obstacle is in range", async () => {
        vi.resetModules()
        const { RangeSensor, MAX_RANGE } = await import("./rangeSensor")

        // Obstacle fixture 30cm ahead
        const obstacleFixture = {
            getUserData: () => ({ roles: ["obstacle"], label: "obs1" }),
            getBody: () => ({
                getPosition: () => ({ x: 45, y: 15 }),
                getAngle: () => 0,
                getTransform: () => ({ p: { x: 45, y: 15 }, q: { c: 1, s: 0 } }),
            }),
            getShape: () => ({
                getType: () => "polygon",
                m_vertices: [
                    { x: -2, y: -2 }, { x: 2, y: -2 }, { x: 2, y: 2 }, { x: -2, y: 2 }
                ],
            }),
        }

        const coneLabel = "J2.cone."
        const coneFixture = {
            getUserData: () => ({ label: coneLabel, roles: [] }),
            getShape: () => ({ getType: () => "polygon", m_vertices: [] }),
            getBody: () => ({ getTransform: () => ({ p: { x: 45, y: 45 }, q: { c: 1, s: 0 } }) }),
        }

        const contact = {
            getFixtureA: () => coneFixture,
            getFixtureB: () => obstacleFixture,
            next: null,
        }

        const mockBot = {
            entity: {
                physicsObj: {
                    body: {
                        getContactList: () => ({ contact, next: null }),
                        createFixture: vi.fn(() => coneFixture),
                    },
                    getWorldPoint: (p: { x: number; y: number }) => p,
                },
            },
            pos: { x: 45, y: 45 },
            angle: 0,
            forward: { x: 0, y: -1 },
        } as unknown as any

        const sensor = new RangeSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "left", angle: 30, maxRange: MAX_RANGE })
        ;(sensor as unknown as { _coneLabel: string })._coneLabel = coneLabel
        const dist = sensor.read()
        // Should detect something closer than MAX_RANGE
        expect(dist).toBeLessThanOrEqual(MAX_RANGE)
    })
})
