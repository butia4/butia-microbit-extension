import { Vec2Like } from "../types/vec2"
import { EntitySpec } from "../sim/entitySpec"

export type SpawnSpec = { pos: Vec2Like; angle: number }

// Sensor mode/angle/direction/cone-visibility configuration lives entirely in
// sensorSettingsStore.ts now — it's a property of the user's robot setup, not
// the selected map. Maps only describe the arena (walls, entities, spawns).
export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
}
