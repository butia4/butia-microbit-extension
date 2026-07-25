import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_SENSOR_SETTINGS, SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { resolveMap } from "../../../maps/registry"

export type SensorSettingsState = Record<number, SensorSettings>

const initialState: SensorSettingsState = {}

export const sensorSettingsSlice = createSlice({
    name: "sensorSettings",
    initialState,
    reducers: {
        setSensorSettings: (state, action: PayloadAction<{ mapId: number; value: SensorSettings }>) => {
            state[action.payload.mapId] = action.payload.value
        },
        clearSensorSettings: (state, action: PayloadAction<{ mapId: number }>) => {
            const { mapId } = action.payload
            state[mapId] = resolveMap(mapId)?.defaultSensorSettings ?? DEFAULT_SENSOR_SETTINGS
        },
    },
})

export const { setSensorSettings, clearSensorSettings } = sensorSettingsSlice.actions

export default sensorSettingsSlice.reducer
