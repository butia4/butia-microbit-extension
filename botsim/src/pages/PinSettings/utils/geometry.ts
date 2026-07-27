import { Vec2Like } from "../../../shared/types/vec2"
import { appoximateArc } from "../../../shared/geometry"
import { PinAssignment } from "../model/pinAssignment.model"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { DEFAULT_ANGLE, DEFAULT_DIRECTION, DEFAULT_RANGE, MOUNT_ORDER, PREVIEW_UNITS_PER_CM } from "../constants"

function cmToViewboxPct(cm: number, chassisSideCm: number): number {
    return ((cm + chassisSideCm / 2) / chassisSideCm) * 100
}

export function chassisCornerRadiusPct(sideCm: number, cornerRadiusCm: number): number {
    return (cornerRadiusCm / sideCm) * 100
}

export function mountPreviewPos(pos: Vec2Like, chassisSideCm: number): { top: string; left: string } {
    return {
        top: `${cmToViewboxPct(pos.y, chassisSideCm)}%`,
        left: `${cmToViewboxPct(pos.x, chassisSideCm)}%`,
    }
}

// arc boundary (not a straight-edge triangle) so every point stays exactly
// `length` from the apex regardless of spread — a straight edge would
// visually shrink the cone as spread widens
const ARC_SEGMENTS = 8

export function coneWedgePoints(apex: { x: number; y: number }, facingDeg: number, spreadDeg: number, rangeCm: number): string {
    const clampedSpread = Math.min(Math.max(spreadDeg, 1), 180)
    const halfDeg = clampedSpread / 2
    const length = rangeCm * PREVIEW_UNITS_PER_CM

    // -90 offset: facingDeg 0=up(-y) clockwise-positive -> appoximateArc's 0=+X convention
    const arc = appoximateArc(apex, length, facingDeg - halfDeg - 90, facingDeg + halfDeg - 90, ARC_SEGMENTS)
    const arcPoints = arc.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)

    return [`${apex.x},${apex.y}`, ...arcPoints].join(" ")
}

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
