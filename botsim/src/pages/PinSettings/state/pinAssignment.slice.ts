import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_PIN_ASSIGNMENT, PinAssignment } from "../model/pinAssignment.model"
import { resolveMap } from "../../../maps/registry"

export type PinAssignmentState = Record<number, PinAssignment>

const initialState: PinAssignmentState = {}

export const pinAssignmentSlice = createSlice({
    name: "pinAssignment",
    initialState,
    reducers: {
        setPinAssignment: (state, action: PayloadAction<{ mapId: number; value: PinAssignment }>) => {
            state[action.payload.mapId] = action.payload.value
        },
        clearPinAssignment: (state, action: PayloadAction<{ mapId: number }>) => {
            const { mapId } = action.payload
            state[mapId] = resolveMap(mapId)?.defaultPinAssignment ?? DEFAULT_PIN_ASSIGNMENT
        },
    },
})

export const { setPinAssignment, clearPinAssignment } = pinAssignmentSlice.actions

export default pinAssignmentSlice.reducer
