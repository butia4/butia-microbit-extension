import { RangeSensorSpec } from "../../../botSpecs/botSpec"
import { SONAR_COLORS } from "../../rendering/sonarVisuals"
import { ConeContactSensor, ConeSensorConfig } from "./coneContactSensor"
import { BotHandle } from "../botHandle"

export const LIGHT_MAX_RANGE = 40 // cm

export const DEFAULT_LIGHT_ANGLE = 75 // degrees; wider than RangeSensor's 30 deg, tuned via user testing

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

export class LightSensor extends ConeContactSensor {
    constructor(bot: BotHandle, spec: RangeSensorSpec, showCone: boolean = false) {
        super(bot, spec, LIGHT_CONFIG, showCone)
    }
}
