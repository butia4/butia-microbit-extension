import { describe, it, expect, vi, beforeEach } from "vitest"
import { decodePacket, encodePacket } from "../protocol"

describe("decodePacket", () => {
    it("parses a valid state message", () => {
        const msg = { type: "state", id: "abc", motorLeft: 50, motorRight: -30, sensors: { J2: "distance" } }
        const encoded = new TextEncoder().encode(JSON.stringify(msg))
        const result = decodePacket(encoded.buffer)
        expect(result).not.toBeNull()
        expect(result?.type).toBe("state")
        expect(result && "motorLeft" in result && result.motorLeft).toBe(50)
        expect(result && "sensors" in result && result.sensors).toEqual({ J2: "distance" })
    })

    it("returns null for non-state messages", () => {
        const msg = { type: "sensors", id: "abc", values: {} }
        const encoded = new TextEncoder().encode(JSON.stringify(msg))
        expect(decodePacket(encoded.buffer)).toBeNull()
    })

    it("returns null for malformed data", () => {
        expect(decodePacket(new Uint8Array([0xff, 0xfe]).buffer)).toBeNull()
    })

    it("parses a valid mapselect message", () => {
        const msg = { type: "mapselect", id: 1 }
        const encoded = new TextEncoder().encode(JSON.stringify(msg))
        const result = decodePacket(encoded.buffer)
        expect(result).not.toBeNull()
        expect(result?.type).toBe("mapselect")
        expect((result as { id: number }).id).toBe(1)
    })

    it("returns null for malformed mapselect shapes", () => {
        const msg = { type: "mapselectt", id: 1 }
        const encoded = new TextEncoder().encode(JSON.stringify(msg))
        expect(decodePacket(encoded.buffer)).toBeNull()
    })
})

describe("encodePacket", () => {
    it("encodes a sensors message as Uint8Array", () => {
        const msg = { type: "sensors" as const, id: "abc", values: { J2: 45.2, J5: 0 } }
        const encoded = encodePacket(msg)
        // Check byteLength > 0 instead of instanceof — avoids cross-realm Uint8Array issue in jsdom
        expect(encoded.byteLength).toBeGreaterThan(0)
        const decoded = JSON.parse(new TextDecoder().decode(encoded))
        expect(decoded.type).toBe("sensors")
        expect(decoded.values.J2).toBeCloseTo(45.2)
    })
})

describe("makecodeService.init", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
    })

    it("registers a message listener on window", async () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener")
        const { init } = await import("./makecodeService")
        init({ onState: vi.fn() })
        expect(addEventListenerSpy).toHaveBeenCalledWith("message", expect.any(Function))
    })

    it("calls onState callback when a valid state messagepacket arrives", async () => {
        vi.resetModules()
        const { init } = await import("./makecodeService")
        const onState = vi.fn()
        init({ onState })

        const msg = { type: "state", id: "run1", motorLeft: 100, motorRight: 100, sensors: { J2: "distance" } }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        window.dispatchEvent(new MessageEvent("message", {
            data: { type: "messagepacket", channel: "butia4/butia-microbit-extension", data: data.buffer }
        }))
        expect(onState).toHaveBeenCalledWith(expect.objectContaining({ id: "run1" }))
    })

    it("ignores messagepackets on other channels", async () => {
        vi.resetModules()
        const { init } = await import("./makecodeService")
        const onState = vi.fn()
        init({ onState })

        const msg = { type: "state", id: "run1", motorLeft: 0, motorRight: 0, sensors: {} }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        window.dispatchEvent(new MessageEvent("message", {
            data: { type: "messagepacket", channel: "robot", data: data.buffer }
        }))
        expect(onState).not.toHaveBeenCalled()
    })

    it("calls onMapSelect and not onState when a mapselect packet arrives", async () => {
        vi.resetModules()
        const { init } = await import("./makecodeService")
        const onState = vi.fn()
        const onMapSelect = vi.fn()
        init({ onState, onMapSelect })

        const msg = { type: "mapselect", id: 1 }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        window.dispatchEvent(new MessageEvent("message", {
            data: { type: "messagepacket", channel: "butia4/butia-microbit-extension", data: data.buffer }
        }))
        expect(onMapSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
        expect(onState).not.toHaveBeenCalled()
    })
})
