import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type RobotModelId = "butiaV4" | "butiaV3"

export type RobotModelState = { current: RobotModelId }

const initialState: RobotModelState = { current: "butiaV4" }

export const robotModelSlice = createSlice({
    name: "robotModel",
    initialState,
    reducers: {
        // Absent/unrecognized model id defaults to v4, mirroring resolveBotSpec's
        // fallback so older PXT builds (or messages with no model field) keep working.
        setRobotModel: (state, action: PayloadAction<string | undefined>) => {
            state.current = action.payload === "butiaV3" ? "butiaV3" : "butiaV4"
        },
    },
})

export const { setRobotModel } = robotModelSlice.actions

export default robotModelSlice.reducer
