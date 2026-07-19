import { PinAssignment } from "../model/pinAssignment.model"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { CONE_LENGTH, DEFAULT_ANGLE, DEFAULT_DIRECTION, MOUNT_ORDER } from "../constants"

export function coneWedgePoints(spreadDeg: number): string {
    const clampedSpread = Math.min(Math.max(spreadDeg, 1), 180)
    const halfRad = (clampedSpread / 2) * (Math.PI / 180)
    const cx = 32
    const cy = 32
    const leftX = cx - CONE_LENGTH * Math.sin(halfRad)
    const leftY = cy - CONE_LENGTH * Math.cos(halfRad)
    const rightX = cx + CONE_LENGTH * Math.sin(halfRad)
    const rightY = cy - CONE_LENGTH * Math.cos(halfRad)
    return `${cx},${cy} ${leftX.toFixed(1)},${leftY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}`
}

// Builds the combined form's initial values from the two persisted Redux
// slices. Guarantees every mount's angle/direction hold a valid default
// (DEFAULT_ANGLE/DEFAULT_DIRECTION) even when unconfigured or in "surface"
// mode — required because the combined schema validates angle/direction as
// non-optional numbers on every submit, not just for "forward" mounts.
export function toDefaultFormValues(
    assignment: PinAssignment,
    sensorSettings: SensorSettings
): PinSettingsFormValues {
    const mounts = {} as PinSettingsFormValues["mounts"]
    for (const side of MOUNT_ORDER) {
        const cfg = sensorSettings[side]
        mounts[side] = {
            connector: assignment[side] ?? "",
            mode: cfg?.mode ?? "surface",
            angle: cfg?.angle ?? DEFAULT_ANGLE,
            direction: cfg?.direction ?? DEFAULT_DIRECTION,
        }
    }
    return { mounts }
}
