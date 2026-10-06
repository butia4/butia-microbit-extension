import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { LINE_A_TO_B_MAP } from "../maps/lineAToBMap"

export type CurrentMapState = { mapId: number }

const initialState: CurrentMapState = { mapId: LINE_A_TO_B_MAP.id }

export const currentMapSlice = createSlice({
    name: "currentMap",
    initialState,
    reducers: {
        setCurrentMapId: (state, action: PayloadAction<number>) => {
            state.mapId = action.payload
        },
    },
})

export const { setCurrentMapId } = currentMapSlice.actions

export default currentMapSlice.reducer
