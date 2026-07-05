import { Vec2Like } from "../types/vec2"
import { EntitySpec } from "../sim/specs"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export type MapSpec = {
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
}
