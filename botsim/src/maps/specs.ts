import { Vec2Like } from "../types/vec2"
import { EntitySpec } from "../sim/specs"
import { ConnectorSlot } from "../bots/specs"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
    // Optional per-connector sensor mode override. Absent connectors (or an
    // absent field entirely) default to "forward" (existing cone-raycast
    // behavior) — see Bot's constructor.
    sensorModes?: Partial<Record<ConnectorSlot, "forward" | "surface">>
}
