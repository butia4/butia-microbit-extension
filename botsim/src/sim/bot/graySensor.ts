import { MountSensorSpec } from "../../botSpecs/botSpec"
import { SONAR_COLORS } from "./sonarVisuals"
import { PointContactSensor, PointSensorConfig } from "./pointContactSensor"
import { BotHandle } from "./botHandle"

const GRAY_CONFIG: PointSensorConfig = {
    roleTag: "follow-line",
    onValue: 1023,
    offValue: 0,
    labelSuffix: "sensor",
    wavePrefix: "gray",
    ownRoles: ["gray-sensor"],
    sonarColor: SONAR_COLORS.gray,
}

// Thin wrapper over PointContactSensor — see pointContactSensor.ts for the
// shared point-overlap fixture/contact logic. GraySensor reports 1023 while
// overlapping a "follow-line"-tagged fixture, 0 otherwise.
export class GraySensor extends PointContactSensor {
    constructor(bot: BotHandle, spec: MountSensorSpec) {
        super(bot, spec, GRAY_CONFIG)
    }
}
