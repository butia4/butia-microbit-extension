import { describe, it, expect, beforeEach } from "vitest"
import { getPinAssignment, setPinAssignment, clearPinAssignment } from "./pinAssignmentStore"

describe("pinAssignmentStore", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("returns null when nothing has been persisted yet", () => {
        expect(getPinAssignment()).toBeNull()
    })

    it("round-trips a valid assignment through set/get", () => {
        const result = setPinAssignment({ left: "J1", right: "J2" })
        expect(result).toEqual({ ok: true })
        expect(getPinAssignment()).toEqual({ left: "J1", right: "J2" })
    })

    it("clear() removes a persisted assignment", () => {
        setPinAssignment({ left: "J1", right: "J2" })
        clearPinAssignment()
        expect(getPinAssignment()).toBeNull()
    })

    it("rejects assigning the same port to both mounts, without persisting", () => {
        const result = setPinAssignment({ left: "J3", right: "J3" })
        expect(result.ok).toBe(false)
        if (!result.ok) {
            expect(result.error).toMatch(/mismo conector/i)
        }
        expect(getPinAssignment()).toBeNull()
    })

    it("does not overwrite an existing valid assignment when a duplicate-port change is rejected", () => {
        setPinAssignment({ left: "J1", right: "J2" })
        setPinAssignment({ left: "J4", right: "J4" })
        expect(getPinAssignment()).toEqual({ left: "J1", right: "J2" })
    })

    it("returns null on malformed JSON in localStorage", () => {
        localStorage.setItem("butia-sim:pinAssignment", "{not valid json")
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null on missing fields", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ left: "J1" }))
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null on an invalid connector slot value", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ left: "J9", right: "J2" }))
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null when the stored left/right ports are duplicated", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ left: "J2", right: "J2" }))
        expect(getPinAssignment()).toBeNull()
    })
})
