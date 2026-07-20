import { PinAssignment } from "../model/pinAssignment.model"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { DEFAULT_ANGLE, DEFAULT_DIRECTION, DEFAULT_RANGE, MOUNT_ORDER, PREVIEW_UNITS_PER_CM } from "../constants"

// Draws the cone as a polygon directly in the chassis illustration's shared
// 0-100 viewBox (apex at the mount's own position, not a fixed local center)
// so its length scales with the sensor's real maxRange, at the same
// units/cm as the rest of the illustration (PREVIEW_UNITS_PER_CM) — matching
// how buildSonarVisuals scales the sim's cone by maxRange * RENDER_SCALE.
// facingDeg follows the same clockwise-positive, 0=up(-y) convention as
// MOUNT_FACING_DEG/the sim (see ChassisIllustration).
export function coneWedgePoints(apex: { x: number; y: number }, facingDeg: number, spreadDeg: number, rangeCm: number): string {
    const clampedSpread = Math.min(Math.max(spreadDeg, 1), 180)
    const halfRad = (clampedSpread / 2) * (Math.PI / 180)
    const length = rangeCm * PREVIEW_UNITS_PER_CM
    const facingRad = facingDeg * (Math.PI / 180)

    const rotate = (x: number, y: number): { x: number; y: number } => ({
        x: x * Math.cos(facingRad) - y * Math.sin(facingRad),
        y: x * Math.sin(facingRad) + y * Math.cos(facingRad),
    })

    const left = rotate(-length * Math.sin(halfRad), -length * Math.cos(halfRad))
    const right = rotate(length * Math.sin(halfRad), -length * Math.cos(halfRad))

    return [
        `${apex.x},${apex.y}`,
        `${(apex.x + left.x).toFixed(1)},${(apex.y + left.y).toFixed(1)}`,
        `${(apex.x + right.x).toFixed(1)},${(apex.y + right.y).toFixed(1)}`,
    ].join(" ")
}

// Builds the combined form's initial values from the two persisted Redux
// slices. Guarantees every mount's angle/direction/range hold a valid
// default (DEFAULT_ANGLE/DEFAULT_DIRECTION/DEFAULT_RANGE) even when
// unconfigured or in "surface" mode — required because the combined schema
// validates angle/direction/range as non-optional numbers on every submit,
// not just for "forward" mounts.
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
            range: cfg?.range ?? DEFAULT_RANGE,
        }
    }
    return { mounts }
}
