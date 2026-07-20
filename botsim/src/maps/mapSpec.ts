import { Vec2Like } from "../shared/types/vec2"
import { EntitySpec } from "../sim/entitySpec"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
}
