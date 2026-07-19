import { describe, it, expect, vi } from "vitest"
import { Vec2 } from "../../types/vec2"

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

function makeMockBot() {
    return {
        entity: {
            physicsObj: {
                body: {
                    getContactList: () => null,
                    createFixture: vi.fn(() => ({ getUserData: () => ({}) })),
                },
                getWorldPoint: (p: { x: number; y: number }) => p,
            },
            renderObj: undefined,
        },
        pos: { x: 0, y: 0 },
        angle: 0,
        forward: { x: 0, y: -1 },
    } as unknown as any
}

// Regression coverage for the bug the design doc flags: beam direction used
// to be hardcoded to local -y (front) regardless of mount `pos` — `angle` on
// a MountSensorSpec is ONLY cone spread width, never heading. Without
// `facingDeg` threaded into cone-vertex rotation, a `sideLeft`/`sideRight`/
// `rearLeft` sensor's cone would render/raycast identically to a frontal
// one, which these assertions would catch (rotatedVerts would equal
// frontVerts instead of the rotated expectation below).
describe("ConeContactSensor facing rotation", () => {
    it.each([
        ["sideLeft", -90],
        ["sideRight", 90],
        ["rearLeft", 180],
    ])("rotates the cone verts by facingDeg for %s relative to a frontLeft (facingDeg 0) sensor", async (_name, facingDeg) => {
        const { RangeSensor, MAX_RANGE } = await import("./rangeSensor")

        const front = new RangeSensor(makeMockBot(), { pos: { x: 0, y: 0 }, name: "frontLeft", angle: 30, maxRange: MAX_RANGE, facingDeg: 0 })
        const rotated = new RangeSensor(makeMockBot(), { pos: { x: 0, y: 0 }, name: "frontLeft", angle: 30, maxRange: MAX_RANGE, facingDeg })

        const frontVerts = (front as unknown as { sensorVerts: { x: number; y: number }[] }).sensorVerts
        const rotatedVerts = (rotated as unknown as { sensorVerts: { x: number; y: number }[] }).sensorVerts

        expect(frontVerts.length).toBe(rotatedVerts.length)
        for (let i = 0; i < frontVerts.length; i++) {
            const expected = Vec2.rotateDeg(frontVerts[i], facingDeg)
            expect(rotatedVerts[i].x).toBeCloseTo(expected.x, 5)
            expect(rotatedVerts[i].y).toBeCloseTo(expected.y, 5)
        }
    })

    it("defaults facingDeg to 0 when omitted — frontal sensors render/raycast identically to before this change", async () => {
        const { RangeSensor, MAX_RANGE } = await import("./rangeSensor")

        const withoutFacing = new RangeSensor(makeMockBot(), { pos: { x: 0, y: 0 }, name: "frontLeft", angle: 30, maxRange: MAX_RANGE })
        const withZeroFacing = new RangeSensor(makeMockBot(), { pos: { x: 0, y: 0 }, name: "frontLeft", angle: 30, maxRange: MAX_RANGE, facingDeg: 0 })

        const a = (withoutFacing as unknown as { sensorVerts: { x: number; y: number }[] }).sensorVerts
        const b = (withZeroFacing as unknown as { sensorVerts: { x: number; y: number }[] }).sensorVerts

        expect(a).toEqual(b)
    })
})
