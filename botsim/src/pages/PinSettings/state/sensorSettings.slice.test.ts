import { describe, it, expect } from "vitest"
import reducer, { setSensorSettings, clearSensorSettings, SensorSettingsState } from "./sensorSettings.slice"
import { DEFAULT_MAP } from "../../../maps/defaultMap"

describe("sensorSettings slice", () => {
    it("starts with an empty record", () => {
        expect(reducer(undefined, { type: "@@INIT" })).toEqual({})
    })

    it("sets the settings for a given mapId without touching other mapIds", () => {
        const initial: SensorSettingsState = { 2: { frontLeft: { mode: "surface" } } }

        const state = reducer(initial, setSensorSettings({ mapId: 1, value: { frontRight: { mode: "forward" } } }))

        expect(state[1]).toEqual({ frontRight: { mode: "forward" } })
        expect(state[2]).toEqual({ frontLeft: { mode: "surface" } })
    })

    it("clears the current map's settings back to that map's hardcoded default", () => {
        const initial: SensorSettingsState = {
            [DEFAULT_MAP.id]: { frontLeft: { mode: "forward" } },
            2: { frontRight: { mode: "surface" } },
        }

        const state = reducer(initial, clearSensorSettings({ mapId: DEFAULT_MAP.id }))

        expect(state[DEFAULT_MAP.id]).toEqual(DEFAULT_MAP.defaultSensorSettings)
        expect(state[2]).toEqual({ frontRight: { mode: "surface" } })
    })

    it("falls back to the empty default when clearing a mapId not in the registry", () => {
        const initial: SensorSettingsState = { 999: { frontLeft: { mode: "forward" } } }

        const state = reducer(initial, clearSensorSettings({ mapId: 999 }))

        expect(state[999]).toEqual({})
    })
})
