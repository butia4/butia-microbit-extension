import { Vec2Like } from "../types/vec2"
import { EntitySpec } from "../sim/entitySpec"
import { MountSide } from "../botSpecs/botSpec"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
    // Optional per-mount sensor mode override, keyed by physical mount
    // (left/right) — not by J-port. The mode follows whichever J-port is
    // currently wired to that mount for the run. Absent mounts (or an absent
    // field entirely) default to "forward" (existing cone-raycast behavior)
    // — see Bot's constructor.
    sensorModes?: Partial<Record<MountSide, "forward" | "surface">>
    // Optional per-map override that keeps the sonar cone (wave mesh) always
    // visible for both light sensors while this map is active, instead of
    // the default pulse-only ping feedback. Absent (or false) keeps the
    // default pulse-only behavior — see LightSensor/buildSonarVisuals.
    showLightCone?: boolean
}
