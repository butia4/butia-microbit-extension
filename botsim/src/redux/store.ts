import { configureStore } from "@reduxjs/toolkit"
import pinAssignmentReducer from "../pages/PinSettings/state/pinAssignment.slice"
import sensorSettingsReducer from "../pages/PinSettings/state/sensorSettings.slice"
import { DEFAULT_PIN_ASSIGNMENT, PinAssignment, pinAssignmentSchema } from "../pages/PinSettings/model/pinAssignment.model"
import { DEFAULT_SENSOR_SETTINGS, SensorSettings, sensorSettingsSchema } from "../botSpecs/sensorSettings.model"

const PIN_ASSIGNMENT_KEY = "butia-sim:pinAssignment"
const SENSOR_SETTINGS_KEY = "butia-sim:sensorSettings"

function loadPreloadedState() {
    let pinAssignment: PinAssignment = DEFAULT_PIN_ASSIGNMENT
    let sensorSettings: SensorSettings = DEFAULT_SENSOR_SETTINGS

    try {
        const raw = localStorage.getItem(PIN_ASSIGNMENT_KEY)
        if (raw) {
            const result = pinAssignmentSchema.safeParse(JSON.parse(raw))
            if (result.success) pinAssignment = result.data
        }
    } catch {
        // malformed/inaccessible localStorage — fall back to default
    }

    try {
        const raw = localStorage.getItem(SENSOR_SETTINGS_KEY)
        if (raw) {
            const result = sensorSettingsSchema.safeParse(JSON.parse(raw))
            if (result.success) sensorSettings = result.data
        }
    } catch {
        // malformed/inaccessible localStorage — fall back to default
    }

    return { pinAssignment, sensorSettings }
}

const store = configureStore({
    reducer: {
        pinAssignment: pinAssignmentReducer,
        sensorSettings: sensorSettingsReducer,
    },
    preloadedState: loadPreloadedState(),
})

// Persists pinAssignment/sensorSettings to localStorage on change.
let lastPersistedPinAssignment = store.getState().pinAssignment
let lastPersistedSensorSettings = store.getState().sensorSettings

store.subscribe(() => {
    const state = store.getState()

    if (state.pinAssignment !== lastPersistedPinAssignment) {
        lastPersistedPinAssignment = state.pinAssignment
        try {
            localStorage.setItem(PIN_ASSIGNMENT_KEY, JSON.stringify(state.pinAssignment))
        } catch {
            // no-op — persistence is best-effort
        }
    }

    if (state.sensorSettings !== lastPersistedSensorSettings) {
        lastPersistedSensorSettings = state.sensorSettings
        try {
            localStorage.setItem(SENSOR_SETTINGS_KEY, JSON.stringify(state.sensorSettings))
        } catch {
            // no-op — persistence is best-effort
        }
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
