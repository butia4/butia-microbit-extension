import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_PIN_ASSIGNMENT, PinAssignment } from "../model/pinAssignment.model"

// Validation lives in pages/PinSettings/model/pinAssignment.model.ts (pinAssignmentSchema),
// run before dispatch — see components/PinSettingsPage.tsx.
export const pinAssignmentSlice = createSlice({
    name: "pinAssignment",
    initialState: DEFAULT_PIN_ASSIGNMENT,
    reducers: {
        setPinAssignment: (_state, action: PayloadAction<PinAssignment>) => action.payload,
        clearPinAssignment: () => DEFAULT_PIN_ASSIGNMENT,
    },
})

export const { setPinAssignment, clearPinAssignment } = pinAssignmentSlice.actions

export default pinAssignmentSlice.reducer
