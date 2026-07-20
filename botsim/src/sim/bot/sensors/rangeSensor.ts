import { RangeSensorSpec } from "../../../botSpecs/botSpec"
import { SONAR_COLORS } from "../../rendering/sonarVisuals"
import { ConeContactSensor, ConeSensorConfig } from "./coneContactSensor"
import { BotHandle } from "../botHandle"

export const MAX_RANGE = 400 // cm

export const DEFAULT_RANGE_ANGLE = 30 // degrees

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

export class RangeSensor extends ConeContactSensor implements DistanceSensor {
    constructor(bot: BotHandle, spec: RangeSensorSpec) {
        super(bot, spec, RANGE_CONFIG)
    }
}
