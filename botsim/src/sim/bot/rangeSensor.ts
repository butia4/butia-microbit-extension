import { RangeSensorSpec } from "../../botSpecs/botSpec"
import { SONAR_COLORS } from "./sonarVisuals"
import { ConeContactSensor, ConeSensorConfig } from "./coneContactSensor"
import { BotHandle } from "./botHandle"

export const MAX_RANGE = 400 // cm

// Default beam angle applied when a connector spec omits `angle` — preserves
// today's hardcoded 30° behavior until butiaBotSpec.ts sets real per-connector
// angles.
export const DEFAULT_RANGE_ANGLE = 30 // degrees

// Shared read interface so `Bot` can hold either a `RangeSensor` (cone-raycast)
// or a `SurfaceSensor` (point-overlap) behind one map type without casts.
export interface DistanceSensor {
    read(): number
    readonly value: number
}

const RANGE_CONFIG: ConeSensorConfig = {
    roleTag: "obstacle",
    labelPrefix: "range",
    defaultValue: MAX_RANGE,
    mapDistance: (distance: number) => distance,
    sonarColor: SONAR_COLORS.range,
}

// Thin wrapper over ConeContactSensor — see coneContactSensor.ts for the
// shared cone-cast/raycast logic. RangeSensor reports raw cm distance to the
// nearest "obstacle"-tagged fixture in its cone.
export class RangeSensor extends ConeContactSensor implements DistanceSensor {
    constructor(bot: BotHandle, spec: RangeSensorSpec) {
        super(bot, spec, RANGE_CONFIG)
    }
}
