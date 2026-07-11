import { describe, it, expect, vi } from "vitest"
import type { BotSpec } from "../../bots/specs"

// Bot's constructor pulls in Chassis/Wheel (which touch Planck physics
// joints) and the three sensor classes. For these tests we only care about
// *which* sensor class gets constructed per connector, so mock all of them
// with lightweight stand-ins that are easy to `instanceof`-check.
vi.mock("./chassis", () => ({
    Chassis: class {
        static makeShapeSpec() { return { type: "circle", physics: {}, brush: {} } }
        update() { /* no-op */ }
        destroy() { /* no-op */ }
    },
}))

vi.mock("./wheel", () => ({
    Wheel: class {
        static makeShapeSpec() { return { type: "box", physics: {}, brush: {} } }
        update() { /* no-op */ }
        destroy() { /* no-op */ }
    },
}))

vi.mock("./graySensor", () => ({
    GraySensor: class {
        read() { return 0 }
    },
}))

vi.mock("./rangeSensor", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./rangeSensor")>()
    return {
        ...actual,
        RangeSensor: class {
            read() { return actual.MAX_RANGE }
        },
    }
})

vi.mock("./surfaceSensor", () => ({
    SurfaceSensor: class {
        read() { return 5 }
    },
}))

const baseSpec: BotSpec = {
    name: "TestBot",
    mass: 500,
    chassis: { shape: "circle", radius: 5 },
    wheels: [],
    connectors: [
        { name: "J1", pos: { x: 0, y: -5 } },
        { name: "J2", pos: { x: 0, y: 5 } },
        { name: "J3", pos: { x: 5, y: 0 } },
    ],
}

function makeMockSim() {
    return {
        createEntity: vi.fn(() => ({
            physicsObj: {
                body: { getContactList: () => null, createFixture: vi.fn(() => ({ getUserData: () => ({}) })) },
                pos: { x: 45, y: 45 },
                angle: 0,
                forward: { x: 0, y: -1 },
                addFrictionJoint: vi.fn(() => undefined),
            },
            renderObj: undefined,
            destroy: vi.fn(),
        })),
        physics: { mouseJoint: undefined },
    } as unknown as any
}

describe("Bot sensor construction", () => {
    it("falls back to RangeSensor for every connector when sensorModes is absent (DEFAULT_MAP regression)", async () => {
        const { Bot } = await import("./index")
        const { RangeSensor } = await import("./rangeSensor")
        const { SurfaceSensor } = await import("./surfaceSensor")

        const bot = new Bot(makeMockSim(), { pos: { x: 45, y: 45 }, angle: 0 }, baseSpec)
        const rangeSensors = (bot as unknown as { rangeSensors: Map<string, unknown> }).rangeSensors

        for (const name of ["J1", "J2", "J3"]) {
            expect(rangeSensors.get(name)).toBeInstanceOf(RangeSensor)
            expect(rangeSensors.get(name)).not.toBeInstanceOf(SurfaceSensor)
        }
    })

    it("branches per-connector on a mixed sensorModes map", async () => {
        const { Bot } = await import("./index")
        const { RangeSensor } = await import("./rangeSensor")
        const { SurfaceSensor } = await import("./surfaceSensor")

        const bot = new Bot(
            makeMockSim(),
            { pos: { x: 45, y: 45 }, angle: 0 },
            baseSpec,
            { J1: "surface" }
        )
        const rangeSensors = (bot as unknown as { rangeSensors: Map<string, unknown> }).rangeSensors

        expect(rangeSensors.get("J1")).toBeInstanceOf(SurfaceSensor)
        expect(rangeSensors.get("J2")).toBeInstanceOf(RangeSensor)
        expect(rangeSensors.get("J3")).toBeInstanceOf(RangeSensor)
    })
})
