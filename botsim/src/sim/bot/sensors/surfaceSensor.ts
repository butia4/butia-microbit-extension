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

// Heading-independent point-overlap distance sensor: reports a constant
// SURFACE_ON_VALUE while its mount point overlaps a "table-surface"-tagged
// shape, and MAX_RANGE otherwise. Thin wrapper over PointContactSensor — see
// pointContactSensor.ts for the shared fixture/contact logic. Mirrors
// GraySensor's shape but returns cm (distance sensor semantics) instead of
// an analog 0/1023 value.
export class SurfaceSensor extends PointContactSensor implements DistanceSensor {
    constructor(bot: BotHandle, spec: MountSensorSpec) {
        super(bot, spec, SURFACE_CONFIG)
    }
}
