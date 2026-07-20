import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_SENSOR_SETTINGS, SensorSettings } from "../../../botSpecs/sensorSettings.model"

export const sensorSettingsSlice = createSlice({
    name: "sensorSettings",
    initialState: DEFAULT_SENSOR_SETTINGS,
    reducers: {
        setSensorSettings: (_state, action: PayloadAction<SensorSettings>) => action.payload,
        clearSensorSettings: () => DEFAULT_SENSOR_SETTINGS,
    },
})

export const { setSensorSettings, clearSensorSettings } = sensorSettingsSlice.actions

export default sensorSettingsSlice.reducer
