import { describe, it, expect, beforeEach } from "vitest"
import { z } from "zod"
import { loadOrDefaultMapSlot, persistMapSlot, pinAssignmentKey, sensorSettingsKey } from "./mapSlotPersistence"

const testSchema = z.object({ value: z.string() }).strict()
type TestValue = z.infer<typeof testSchema>
const fallback: TestValue = { value: "default" }

describe("mapSlotPersistence", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe("key builders", () => {
        it("namespaces pin assignment keys by mapId", () => {
            expect(pinAssignmentKey(1)).toBe("butia-sim:pinAssignment:1")
            expect(pinAssignmentKey(2)).toBe("butia-sim:pinAssignment:2")
        })

        it("namespaces sensor settings keys by mapId", () => {
            expect(sensorSettingsKey(1)).toBe("butia-sim:sensorSettings:1")
            expect(sensorSettingsKey(2)).toBe("butia-sim:sensorSettings:2")
        })
    })

    describe("loadOrDefaultMapSlot", () => {
        it("returns the parsed value when a valid entry exists", () => {
            localStorage.setItem(pinAssignmentKey(1), JSON.stringify({ value: "stored" }))

            const result = loadOrDefaultMapSlot(1, pinAssignmentKey, testSchema, fallback)

            expect(result).toEqual({ value: "stored" })
        })

        it("falls back to the default when no key exists", () => {
            const result = loadOrDefaultMapSlot(1, pinAssignmentKey, testSchema, fallback)

            expect(result).toBe(fallback)
        })

        it("falls back to the default on malformed JSON", () => {
            localStorage.setItem(pinAssignmentKey(1), "{not-json")

            const result = loadOrDefaultMapSlot(1, pinAssignmentKey, testSchema, fallback)

            expect(result).toBe(fallback)
        })

        it("falls back to the default when the parsed value fails schema validation", () => {
            localStorage.setItem(pinAssignmentKey(1), JSON.stringify({ value: 42, extra: true }))

            const result = loadOrDefaultMapSlot(1, pinAssignmentKey, testSchema, fallback)

            expect(result).toBe(fallback)
        })
    })

    describe("persistMapSlot", () => {
        it("writes the value to the map-scoped key", () => {
            persistMapSlot(1, pinAssignmentKey, { value: "saved" })

            expect(localStorage.getItem(pinAssignmentKey(1))).toBe(JSON.stringify({ value: "saved" }))
        })

        it("does not affect a different mapId's key", () => {
            persistMapSlot(1, pinAssignmentKey, { value: "map-1" })
            persistMapSlot(2, pinAssignmentKey, { value: "map-2" })

            expect(localStorage.getItem(pinAssignmentKey(1))).toBe(JSON.stringify({ value: "map-1" }))
            expect(localStorage.getItem(pinAssignmentKey(2))).toBe(JSON.stringify({ value: "map-2" }))
        })
    })
})
