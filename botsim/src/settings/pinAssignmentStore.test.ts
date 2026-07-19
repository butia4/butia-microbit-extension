import { describe, it, expect, beforeEach } from "vitest"
import { getPinAssignment, setPinAssignment, clearPinAssignment } from "./pinAssignmentStore"

describe("pinAssignmentStore", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("returns null when nothing has been persisted yet", () => {
        expect(getPinAssignment()).toBeNull()
    })

    it("{} (all-unconfigured) is valid and round-trips", () => {
        const result = setPinAssignment({})
        expect(result).toEqual({ ok: true })
        expect(getPinAssignment()).toEqual({})
    })

    it("round-trips a partial assignment (1 of 6 mounts configured)", () => {
        const result = setPinAssignment({ frontLeft: "J1" })
        expect(result).toEqual({ ok: true })
        expect(getPinAssignment()).toEqual({ frontLeft: "J1" })
    })

    it("round-trips a full 5-of-6 assignment (max possible with 5 connectors)", () => {
        const assignment = {
            frontLeft: "J1", frontRight: "J2", sideLeft: "J3", sideRight: "J4", rearLeft: "J5",
        } as const
        const result = setPinAssignment(assignment)
        expect(result).toEqual({ ok: true })
        expect(getPinAssignment()).toEqual(assignment)
    })

    it("clear() removes a persisted assignment", () => {
        setPinAssignment({ frontLeft: "J1" })
        clearPinAssignment()
        expect(getPinAssignment()).toBeNull()
    })

    it("rejects two configured mounts sharing the same connector, without persisting", () => {
        const result = setPinAssignment({ frontLeft: "J3", rearRight: "J3" })
        expect(result.ok).toBe(false)
        if (!result.ok) {
            expect(result.error).toMatch(/mismo conector/i)
        }
        expect(getPinAssignment()).toBeNull()
    })

    it("rejects a duplicate connector regardless of how many other mounts are unconfigured", () => {
        const result = setPinAssignment({
            frontLeft: "J1", frontRight: "J1", sideLeft: undefined, sideRight: undefined, rearLeft: undefined, rearRight: undefined,
        })
        expect(result.ok).toBe(false)
    })

    it("does not overwrite an existing valid assignment when a duplicate-connector change is rejected", () => {
        setPinAssignment({ frontLeft: "J1", frontRight: "J2" })
        setPinAssignment({ frontLeft: "J4", rearLeft: "J4" })
        expect(getPinAssignment()).toEqual({ frontLeft: "J1", frontRight: "J2" })
    })

    it("returns null on malformed JSON in localStorage", () => {
        localStorage.setItem("butia-sim:pinAssignment", "{not valid json")
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null on an invalid connector slot value", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ frontLeft: "J9" }))
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null on an unknown mount key", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ notAMount: "J1" }))
        expect(getPinAssignment()).toBeNull()
    })

    it("treats the legacy { left, right } shape as absent/invalid on load (breaking reset, no migration)", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify({ left: "J1", right: "J2" }))
        expect(getPinAssignment()).toBeNull()
    })

    it("returns null when the stored value is an array", () => {
        localStorage.setItem("butia-sim:pinAssignment", JSON.stringify(["J1", "J2"]))
        expect(getPinAssignment()).toBeNull()
    })
})
