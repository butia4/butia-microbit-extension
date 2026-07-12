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
        read() { return 111 }
    },
}))

vi.mock("./lightSensor", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./lightSensor")>()
    return {
        ...actual,
        LightSensor: class {
            read() { return 222 }
        },
    }
})

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
    sensorMounts: {
        left: { pos: { x: -3, y: -5 } },
        right: { pos: { x: 3, y: -5 } },
    },
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
    it("exposes exactly 2 mount positions (left, right), each pre-built with a RangeSensor when sensorModes is absent (DEFAULT_MAP regression)", async () => {
        const { Bot } = await import("./index")
        const { RangeSensor } = await import("./rangeSensor")
        const { SurfaceSensor } = await import("./surfaceSensor")

        const bot = new Bot(makeMockSim(), { pos: { x: 45, y: 45 }, angle: 0 }, baseSpec)
        const rangeSensors = (bot as unknown as { rangeSensors: Map<string, unknown> }).rangeSensors

        expect([...rangeSensors.keys()].sort()).toEqual(["left", "right"])
        for (const side of ["left", "right"]) {
            expect(rangeSensors.get(side)).toBeInstanceOf(RangeSensor)
            expect(rangeSensors.get(side)).not.toBeInstanceOf(SurfaceSensor)
        }
    })

    it("branches per-mount on a mixed sensorModes map", async () => {
        const { Bot } = await import("./index")
        const { RangeSensor } = await import("./rangeSensor")
        const { SurfaceSensor } = await import("./surfaceSensor")

        const bot = new Bot(
            makeMockSim(),
            { pos: { x: 45, y: 45 }, angle: 0 },
            baseSpec,
            { left: "surface" }
        )
        const rangeSensors = (bot as unknown as { rangeSensors: Map<string, unknown> }).rangeSensors

        expect(rangeSensors.get("left")).toBeInstanceOf(SurfaceSensor)
        expect(rangeSensors.get("right")).toBeInstanceOf(RangeSensor)
    })

    it("routes \"light\" sensorType reads to lightSensors, not graySensors, resolving connName -> mount via portAssignment", async () => {
        const { Bot } = await import("./index")

        const bot = new Bot(makeMockSim(), { pos: { x: 45, y: 45 }, angle: 0 }, baseSpec)
        bot.setPortAssignment("J1", "J2")
        bot.setSensorMap({ J1: "light", J2: "gray" })

        const result = bot.readSensors()

        // GraySensor mock returns 111, LightSensor mock returns 222 — distinct
        // values prove there's no cross-routing between the two maps.
        expect(result.J1).toBe(222)
        expect(result.J2).toBe(111)
    })

    it("an unassigned J-port reads as disconnected (MAX_RANGE), via the existing miss-path fallback", async () => {
        const { Bot } = await import("./index")
        const { MAX_RANGE } = await import("./rangeSensor")

        const bot = new Bot(makeMockSim(), { pos: { x: 45, y: 45 }, angle: 0 }, baseSpec)
        bot.setPortAssignment("J1", "J2")
        bot.setSensorMap({ J3: "distance" })

        const result = bot.readSensors()

        expect(result.J3).toBe(MAX_RANGE)
    })
})
