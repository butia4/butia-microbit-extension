import { describe, it, expect, vi } from "vitest"

vi.mock("planck", () => ({
    Polygon: vi.fn(() => ({})),
    Vec2: vi.fn((x = 0, y = 0) => ({ x, y })),
    Settings: { maxPolygonVertices: 64 },
    internal: {
        Distance: {
            testOverlap: vi.fn(() => true),
        },
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

const coneLabel = "left.cone."

function makeLightSourceFixture(distance: number) {
    // A small square light-source obstacle placed `distance` cm ahead of the
    // sensor mount (mount is at { x: 0, y: -7.5 } relative to bot origin
    // { x: 45, y: 45 }, bot forward is -y).
    const y = 45 - 7.5 - distance
    return {
        getUserData: () => ({ roles: ["light-source"], label: "light-source-1" }),
        getBody: () => ({
            getPosition: () => ({ x: 45, y }),
            getAngle: () => 0,
            getTransform: () => ({ p: { x: 45, y }, q: { c: 1, s: 0 } }),
        }),
        getShape: () => ({
            getType: () => "polygon",
            m_vertices: [
                { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 },
            ],
        }),
    }
}

function makeConeFixture() {
    return {
        getUserData: () => ({ label: coneLabel, roles: [] }),
        getShape: () => ({ getType: () => "polygon", m_vertices: [] }),
        getBody: () => ({ getTransform: () => ({ p: { x: 45, y: 45 }, q: { c: 1, s: 0 } }) }),
    }
}

function makeMockBot(contactDistance?: number, renderObj?: ReturnType<typeof makeMockRenderObj>["renderObj"]) {
    const coneFixture = makeConeFixture()
    const contactList = contactDistance === undefined
        ? null
        : { contact: { getFixtureA: () => coneFixture, getFixtureB: () => makeLightSourceFixture(contactDistance), next: null }, next: null }

    return {
        entity: {
            physicsObj: {
                body: {
                    getContactList: () => contactList,
                    createFixture: vi.fn(() => coneFixture),
                    destroyFixture: vi.fn(),
                },
            },
            renderObj,
        },
        pos: { x: 45, y: 45 },
        angle: 0,
        forward: { x: 0, y: -1 },
    } as unknown as any
}

describe("LightSensor", () => {
    it("creates a cone fixture on construction", async () => {
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const mockBot = makeMockBot()
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        expect(mockBot.entity.physicsObj.body.createFixture).toHaveBeenCalled()
        expect(sensor._fixtureLabel).toMatch(/^light\.cone\./)
    })

    it("returns 0 when no light-source contacts", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const mockBot = makeMockBot()
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        expect(sensor.read()).toBe(0)
    })

    it("returns near-100 intensity when the light source is right at the sensor (near-zero distance)", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const mockBot = makeMockBot(0)
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = coneLabel
        // Box geometry means the nearest edge is a bit closer than the
        // requested center distance (see rangeSensor.test.ts's own tolerance
        // for the same reason) — assert "very close to 100", not exact.
        expect(sensor.read()).toBeGreaterThanOrEqual(95)
    })

    it("returns a mid-range intensity proportional to distance, monotonically decreasing as distance increases", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")

        const nearBot = makeMockBot(LIGHT_MAX_RANGE / 4)
        const nearSensor = new LightSensor(nearBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        ;(nearSensor as unknown as { _fixtureLabel: string })._fixtureLabel = coneLabel
        const nearValue = nearSensor.read()

        vi.resetModules()
        const { LightSensor: LightSensor2 } = await import("./lightSensor")
        const farBot = makeMockBot((LIGHT_MAX_RANGE * 3) / 4)
        const farSensor = new LightSensor2(farBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        ;(farSensor as unknown as { _fixtureLabel: string })._fixtureLabel = coneLabel
        const farValue = farSensor.read()

        expect(nearValue).toBeGreaterThan(0)
        expect(nearValue).toBeLessThan(100)
        expect(farValue).toBeGreaterThan(0)
        expect(farValue).toBeLessThan(100)
        expect(nearValue).toBeGreaterThan(farValue)
    })

    it("returns 0 when the light source is beyond maxRange", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const mockBot = makeMockBot(LIGHT_MAX_RANGE + 20)
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        ;(sensor as unknown as { _fixtureLabel: string })._fixtureLabel = coneLabel
        expect(sensor.read()).toBe(0)
    })

    it("returns 0 when the light source is outside the cone (no contact reported)", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        // No contact simulates a light source outside the cone — Planck never
        // reports overlap between the cone fixture and the light source.
        const mockBot = makeMockBot()
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        expect(sensor.read()).toBe(0)
    })

    it("builds a ping mesh on construction", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const { renderObj, shapes } = makeMockRenderObj()
        const mockBot = makeMockBot(undefined, renderObj)
        new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        expect(shapes.size).toBe(1) // only the ping/target mesh is built — sonar wave/cone mesh is disabled
        const targetLabel = [...shapes.keys()].find(k => k.startsWith("light.target."))
        expect(targetLabel).toBeDefined()
    })

    it("builds a wave (cone) mesh in addition to the ping mesh when showCone is true", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const { renderObj, shapes } = makeMockRenderObj()
        const mockBot = makeMockBot(undefined, renderObj)
        new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE }, true)
        expect(shapes.size).toBe(2)
        const waveLabel = [...shapes.keys()].find(k => k.startsWith("light.wave."))
        const targetLabel = [...shapes.keys()].find(k => k.startsWith("light.target."))
        expect(waveLabel).toBeDefined()
        expect(targetLabel).toBeDefined()
    })

    it("does not build a wave (cone) mesh when showCone is false or omitted", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const { renderObj, shapes } = makeMockRenderObj()
        const mockBot = makeMockBot(undefined, renderObj)
        new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE }, false)
        expect(shapes.size).toBe(1)
        expect([...shapes.keys()].find(k => k.startsWith("light.wave."))).toBeUndefined()
    })

    it("destroy() removes the cone fixture", async () => {
        vi.resetModules()
        const { LightSensor, LIGHT_MAX_RANGE } = await import("./lightSensor")
        const mockBot = makeMockBot()
        const sensor = new LightSensor(mockBot, { pos: { x: 0, y: -7.5 }, name: "frontLeft", angle: 45, maxRange: LIGHT_MAX_RANGE })
        sensor.destroy()
        expect(mockBot.entity.physicsObj.body.destroyFixture).toHaveBeenCalled()
    })
})
