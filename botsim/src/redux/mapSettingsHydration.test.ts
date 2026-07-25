import { describe, it, expect, beforeEach } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import currentMapReducer from "./currentMap.slice"
import pinAssignmentReducer from "../pages/PinSettings/state/pinAssignment.slice"
import sensorSettingsReducer from "../pages/PinSettings/state/sensorSettings.slice"
import { hydrateMapSettings } from "./mapSettingsHydration"
import { pinAssignmentKey, sensorSettingsKey } from "./mapSlotPersistence"
import { DEFAULT_MAP } from "../maps/defaultMap"
import { TABLE_MAP } from "../maps/tableMap"

function makeTestStore() {
    return configureStore({
        reducer: {
            currentMap: currentMapReducer,
            pinAssignment: pinAssignmentReducer,
            sensorSettings: sensorSettingsReducer,
        },
    })
}

describe("hydrateMapSettings", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("sets the current map id and hydrates default settings on first call for a new mapId", () => {
        const store = makeTestStore()

        store.dispatch(hydrateMapSettings(TABLE_MAP.id))

        const state = store.getState()
        expect(state.currentMap.mapId).toBe(TABLE_MAP.id)
        expect(state.pinAssignment[TABLE_MAP.id]).toEqual(TABLE_MAP.defaultPinAssignment)
        expect(state.sensorSettings[TABLE_MAP.id]).toEqual(TABLE_MAP.defaultSensorSettings)
    })

    it("hydrates from a persisted value instead of the default when one exists", () => {
        localStorage.setItem(pinAssignmentKey(TABLE_MAP.id), JSON.stringify({ frontLeft: "J1" }))
        localStorage.setItem(sensorSettingsKey(TABLE_MAP.id), JSON.stringify({ frontLeft: { mode: "forward" } }))
        const store = makeTestStore()

        store.dispatch(hydrateMapSettings(TABLE_MAP.id))

        const state = store.getState()
        expect(state.pinAssignment[TABLE_MAP.id]).toEqual({ frontLeft: "J1" })
        expect(state.sensorSettings[TABLE_MAP.id]).toEqual({ frontLeft: { mode: "forward" } })
    })

    it("is idempotent: a repeated call for an already-hydrated mapId only updates currentMap.mapId", () => {
        const store = makeTestStore()
        store.dispatch(hydrateMapSettings(TABLE_MAP.id))

        // Mutate state directly via a normal set action to prove hydration is skipped afterward.
        store.dispatch({ type: "pinAssignment/setPinAssignment", payload: { mapId: TABLE_MAP.id, value: { frontLeft: "J2" } } })

        store.dispatch(hydrateMapSettings(TABLE_MAP.id))

        expect(store.getState().pinAssignment[TABLE_MAP.id]).toEqual({ frontLeft: "J2" })
    })

    it("hydrates the boot default map independently of other maps", () => {
        const store = makeTestStore()

        store.dispatch(hydrateMapSettings(DEFAULT_MAP.id))
        store.dispatch(hydrateMapSettings(TABLE_MAP.id))

        const state = store.getState()
        expect(state.pinAssignment[DEFAULT_MAP.id]).toEqual(DEFAULT_MAP.defaultPinAssignment)
        expect(state.pinAssignment[TABLE_MAP.id]).toEqual(TABLE_MAP.defaultPinAssignment)
        expect(state.currentMap.mapId).toBe(TABLE_MAP.id)
    })
})
