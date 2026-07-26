import { Vec2Like } from "../shared/types/vec2"
import { EntitySpec } from "../sim/entitySpec"
import { PinAssignment } from "../pages/PinSettings/model/pinAssignment.model"
import { SensorSettings } from "../botSpecs/sensorSettings.model"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
    // Hardcoded per-map defaults applied the first time this map is used
    // with no persisted configuration (see map-scoped-settings design).
    defaultPinAssignment?: PinAssignment
    defaultSensorSettings?: SensorSettings
}
