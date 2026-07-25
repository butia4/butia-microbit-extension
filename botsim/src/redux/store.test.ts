import { describe, it, expect, beforeEach, vi } from "vitest"
import { pinAssignmentKey, sensorSettingsKey } from "./mapSlotPersistence"
import { DEFAULT_MAP } from "../maps/defaultMap"

// store.ts has import-time side effects (reads localStorage in
// `loadPreloadedState`), so each test resets modules and re-imports fresh.
async function importFreshStore() {
    vi.resetModules()
    const mod = await import("./store")
    return mod.default
}

describe("store boot hydration", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("applies and persists the boot map's default when nothing was persisted", async () => {
        const store = await importFreshStore()
        const state = store.getState()

        expect(state.currentMap.mapId).toBe(DEFAULT_MAP.id)
        expect(state.pinAssignment[DEFAULT_MAP.id]).toEqual(DEFAULT_MAP.defaultPinAssignment)
        expect(state.sensorSettings[DEFAULT_MAP.id]).toEqual(DEFAULT_MAP.defaultSensorSettings)

        expect(localStorage.getItem(pinAssignmentKey(DEFAULT_MAP.id))).toBe(
            JSON.stringify(DEFAULT_MAP.defaultPinAssignment),
        )
        expect(localStorage.getItem(sensorSettingsKey(DEFAULT_MAP.id))).toBe(
            JSON.stringify(DEFAULT_MAP.defaultSensorSettings),
        )
    })

    it("prefers a valid persisted value over the default and does not overwrite it", async () => {
        const persistedPin = { frontLeft: "J1" as const }
        localStorage.setItem(pinAssignmentKey(DEFAULT_MAP.id), JSON.stringify(persistedPin))

        const store = await importFreshStore()
        const state = store.getState()

        expect(state.pinAssignment[DEFAULT_MAP.id]).toEqual(persistedPin)
        expect(localStorage.getItem(pinAssignmentKey(DEFAULT_MAP.id))).toBe(JSON.stringify(persistedPin))
    })

    it("persists distinct mapIds under distinct localStorage keys as their settings change", async () => {
        const store = await importFreshStore()
        const { setPinAssignment } = await import("../pages/PinSettings/state/pinAssignment.slice")

        store.dispatch(setPinAssignment({ mapId: DEFAULT_MAP.id, value: { frontLeft: "J1" } }))
        store.dispatch(setPinAssignment({ mapId: 2, value: { frontLeft: "J2" } }))

        expect(localStorage.getItem(pinAssignmentKey(DEFAULT_MAP.id))).toBe(JSON.stringify({ frontLeft: "J1" }))
        expect(localStorage.getItem(pinAssignmentKey(2))).toBe(JSON.stringify({ frontLeft: "J2" }))
    })
})
