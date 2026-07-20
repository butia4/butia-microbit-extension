import { ALL_MOUNT_SIDES, MountSide } from "../../botSpecs/botSpec"

export const DEFAULT_ANGLE = 45
export const DEFAULT_DIRECTION = 0
export const DEFAULT_RANGE = 40

export { ANGLE_MAX, ANGLE_MIN, DIRECTION_MAX, DIRECTION_MIN, RANGE_MAX, RANGE_MIN } from "../../botSpecs/sensorSettings.model"

// viewBox units/cm derived from the pre-scale 10cm chassis; utils/geometry.ts
// now scales off the current 8cm chassis, so the two units/cm no longer agree
export const PREVIEW_UNITS_PER_CM = 10

export const MOUNT_ORDER: readonly MountSide[] = ALL_MOUNT_SIDES

export const MOUNT_LABELS: Record<MountSide, string> = {
    frontLeft: "Delantero Izquierdo",
    frontRight: "Delantero Derecho",
    sideLeft: "Lateral Izquierdo",
    sideRight: "Lateral Derecho",
    rearLeft: "Trasero Izquierdo",
    rearRight: "Trasero Derecho",
}
