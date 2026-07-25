import { describe, it, expect } from "vitest"
import reducer, { setPinAssignment, clearPinAssignment, PinAssignmentState } from "./pinAssignment.slice"
import { DEFAULT_MAP } from "../../../maps/defaultMap"

describe("pinAssignment slice", () => {
    it("starts with an empty record", () => {
        expect(reducer(undefined, { type: "@@INIT" })).toEqual({})
    })

    it("sets the assignment for a given mapId without touching other mapIds", () => {
        const initial: PinAssignmentState = { 2: { frontLeft: "J1" } }

        const state = reducer(initial, setPinAssignment({ mapId: 1, value: { frontRight: "J2" } }))

        expect(state[1]).toEqual({ frontRight: "J2" })
        expect(state[2]).toEqual({ frontLeft: "J1" })
    })

    it("overwrites only the targeted mapId's entry on repeated sets", () => {
        let state: PinAssignmentState = {}
        state = reducer(state, setPinAssignment({ mapId: 1, value: { frontLeft: "J1" } }))
        state = reducer(state, setPinAssignment({ mapId: 1, value: { frontLeft: "J2" } }))

        expect(state[1]).toEqual({ frontLeft: "J2" })
    })

    it("clears the current map's assignment back to that map's hardcoded default", () => {
        const initial: PinAssignmentState = {
            [DEFAULT_MAP.id]: { frontLeft: "J1" },
            2: { frontRight: "J2" },
        }

        const state = reducer(initial, clearPinAssignment({ mapId: DEFAULT_MAP.id }))

        expect(state[DEFAULT_MAP.id]).toEqual(DEFAULT_MAP.defaultPinAssignment)
        expect(state[2]).toEqual({ frontRight: "J2" })
    })

    it("falls back to the empty default when clearing a mapId not in the registry", () => {
        const initial: PinAssignmentState = { 999: { frontLeft: "J1" } }

        const state = reducer(initial, clearPinAssignment({ mapId: 999 }))

        expect(state[999]).toEqual({})
    })
})
