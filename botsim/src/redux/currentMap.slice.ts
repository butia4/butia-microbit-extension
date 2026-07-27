import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_MAP } from "../maps/defaultMap"

export type CurrentMapState = { mapId: number }

const initialState: CurrentMapState = { mapId: DEFAULT_MAP.id }

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
