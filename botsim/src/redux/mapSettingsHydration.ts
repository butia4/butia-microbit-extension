import type { AppDispatch, RootState } from "./store"
import { setCurrentMapId } from "./currentMap.slice"
import { setPinAssignment } from "../pages/PinSettings/state/pinAssignment.slice"
import { setSensorSettings } from "../pages/PinSettings/state/sensorSettings.slice"
import { loadOrDefaultMapSlot, pinAssignmentKey, sensorSettingsKey } from "./mapSlotPersistence"
import { DEFAULT_PIN_ASSIGNMENT, PinAssignment, pinAssignmentSchema } from "../pages/PinSettings/model/pinAssignment.model"
import { DEFAULT_SENSOR_SETTINGS, SensorSettings, sensorSettingsSchema } from "../botSpecs/sensorSettings.model"
import { resolveMap } from "../maps/registry"

/**
 * Sets the current map id and, the first time a given map id is used in
 * this session, hydrates its pin assignment / sensor settings from
 * localStorage (or the map's hardcoded default if nothing was persisted).
 *
 * Idempotent per `mapId`: once a map's settings are present in state,
 * subsequent calls for the same `mapId` only update the current map id
 * and do not re-hydrate (no general map-switch/rehydrate mechanism is
 * required — see map-scoped-settings spec, "Out of Scope").
 */
export function hydrateMapSettings(mapId: number) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        dispatch(setCurrentMapId(mapId))

        const state = getState()
        const alreadyHydrated = mapId in state.pinAssignment && mapId in state.sensorSettings
        if (alreadyHydrated) return

        const mapSpec = resolveMap(mapId)
        const pinDefault: PinAssignment = mapSpec?.defaultPinAssignment ?? DEFAULT_PIN_ASSIGNMENT
        const sensorDefault: SensorSettings = mapSpec?.defaultSensorSettings ?? DEFAULT_SENSOR_SETTINGS

        const pinAssignment = loadOrDefaultMapSlot(mapId, pinAssignmentKey, pinAssignmentSchema, pinDefault)
        const sensorSettings = loadOrDefaultMapSlot(mapId, sensorSettingsKey, sensorSettingsSchema, sensorDefault)

        dispatch(setPinAssignment({ mapId, value: pinAssignment }))
        dispatch(setSensorSettings({ mapId, value: sensorSettings }))
    }
}
