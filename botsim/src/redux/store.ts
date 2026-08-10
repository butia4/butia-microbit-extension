import { configureStore } from "@reduxjs/toolkit"
import currentMapReducer from "./currentMap.slice"
import robotModelReducer from "./robotModel.slice"
import pinAssignmentReducer, { PinAssignmentState } from "../pages/PinSettings/state/pinAssignment.slice"
import sensorSettingsReducer, { SensorSettingsState } from "../pages/PinSettings/state/sensorSettings.slice"
import { DEFAULT_MAP } from "../maps/defaultMap"
import { resolveMap } from "../maps/registry"
import { DEFAULT_PIN_ASSIGNMENT, PinAssignment, pinAssignmentSchema } from "../pages/PinSettings/model/pinAssignment.model"
import { DEFAULT_SENSOR_SETTINGS, SensorSettings, sensorSettingsSchema } from "../botSpecs/sensorSettings.model"
import { loadOrDefaultMapSlot, persistMapSlot, pinAssignmentKey, sensorSettingsKey } from "./mapSlotPersistence"

function loadPreloadedState() {
    const mapId = DEFAULT_MAP.id
    const mapSpec = resolveMap(mapId)
    const pinDefault: PinAssignment = mapSpec?.defaultPinAssignment ?? DEFAULT_PIN_ASSIGNMENT
    const sensorDefault: SensorSettings = mapSpec?.defaultSensorSettings ?? DEFAULT_SENSOR_SETTINGS

    const pinAssignment = loadOrDefaultMapSlot(mapId, pinAssignmentKey, pinAssignmentSchema, pinDefault)
    const sensorSettings = loadOrDefaultMapSlot(mapId, sensorSettingsKey, sensorSettingsSchema, sensorDefault)

    // loadOrDefaultMapSlot returns the fallback by reference when nothing
    // valid was persisted — persist the default immediately in that case
    // (Requirement: Per-Map Default Application, "first-time use" scenario).
    if (pinAssignment === pinDefault) persistMapSlot(mapId, pinAssignmentKey, pinAssignment)
    if (sensorSettings === sensorDefault) persistMapSlot(mapId, sensorSettingsKey, sensorSettings)

    return {
        currentMap: { mapId },
        pinAssignment: { [mapId]: pinAssignment } as PinAssignmentState,
        sensorSettings: { [mapId]: sensorSettings } as SensorSettingsState,
    }
}

const store = configureStore({
    reducer: {
        currentMap: currentMapReducer,
        robotModel: robotModelReducer,
        pinAssignment: pinAssignmentReducer,
        sensorSettings: sensorSettingsReducer,
    },
    preloadedState: loadPreloadedState(),
})

// Persists pinAssignment/sensorSettings to sessionStorage on change, per
// changed mapId key (see map-scoped-settings design: "Persistence trigger").
let lastPinAssignment = store.getState().pinAssignment
let lastSensorSettings = store.getState().sensorSettings

store.subscribe(() => {
    const state = store.getState()

    if (state.pinAssignment !== lastPinAssignment) {
        for (const key of Object.keys(state.pinAssignment)) {
            const mapId = Number(key)
            if (state.pinAssignment[mapId] !== lastPinAssignment[mapId]) {
                persistMapSlot(mapId, pinAssignmentKey, state.pinAssignment[mapId])
            }
        }
        lastPinAssignment = state.pinAssignment
    }

    if (state.sensorSettings !== lastSensorSettings) {
        for (const key of Object.keys(state.sensorSettings)) {
            const mapId = Number(key)
            if (state.sensorSettings[mapId] !== lastSensorSettings[mapId]) {
                persistMapSlot(mapId, sensorSettingsKey, state.sensorSettings[mapId])
            }
        }
        lastSensorSettings = state.sensorSettings
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
