import { MountSensorSpec } from "../../../botSpecs/botSpec"
import { SONAR_COLORS } from "../../rendering/sonarVisuals"
import { PointContactSensor, PointSensorConfig } from "./pointContactSensor"
import { DistanceSensor, MAX_RANGE } from "./rangeSensor"
import { BotHandle } from "../botHandle"

export const SURFACE_ON_VALUE = 5 // cm

const SURFACE_CONFIG: PointSensorConfig = {
    roleTag: "table-surface",
    onValue: SURFACE_ON_VALUE,
    offValue: MAX_RANGE,
    labelSuffix: "surface",
    wavePrefix: "surface",
    ownRoles: [],
    sonarColor: SONAR_COLORS.surface,
}

export class SurfaceSensor extends PointContactSensor implements DistanceSensor {
    constructor(bot: BotHandle, spec: MountSensorSpec) {
        super(bot, spec, SURFACE_CONFIG)
    }
}
