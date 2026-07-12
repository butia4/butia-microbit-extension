import { RangeSensorSpec } from "../../botSpecs/botSpec"
import { SONAR_COLORS } from "./sonarVisuals"
import { ConeContactSensor, ConeSensorConfig } from "./coneContactSensor"
import { BotHandle } from "./botHandle"

export const LIGHT_MAX_RANGE = 40 // cm

// Default cone angle applied when a connector spec omits `angle`. Wider than
// RangeSensor's narrow 30° (long-range obstacle beam) to make the Luz map's
// seek behavior more forgiving — tuned up from 45° to 75° per user testing.
export const DEFAULT_LIGHT_ANGLE = 75 // degrees

const LIGHT_CONFIG: ConeSensorConfig = {
    roleTag: "light-source",
    labelPrefix: "light",
    defaultValue: 0,
    mapDistance: (distance: number, maxRange: number) => {
        const raw = 100 * (1 - distance / maxRange)
        return Math.round(Math.min(100, Math.max(0, raw)))
    },
    sonarColor: SONAR_COLORS.light,
}

// Thin wrapper over ConeContactSensor — see coneContactSensor.ts for the
// shared cone-cast/raycast logic. LightSensor detects entities tagged
// "light-source" and converts nearest-hit distance into a 0-100 intensity
// via linear falloff, instead of RangeSensor's raw cm.
export class LightSensor extends ConeContactSensor {
    constructor(bot: BotHandle, spec: RangeSensorSpec, showCone: boolean = false) {
        super(bot, spec, LIGHT_CONFIG, showCone)
    }
}
