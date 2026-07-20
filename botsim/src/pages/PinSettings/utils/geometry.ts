import { Vec2Like } from "../../../shared/types/vec2"
import { appoximateArc } from "../../../shared/geometry"
import { PinAssignment } from "../model/pinAssignment.model"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { DEFAULT_ANGLE, DEFAULT_DIRECTION, DEFAULT_RANGE, MOUNT_ORDER, PREVIEW_UNITS_PER_CM } from "../constants"

// Converts a chassis-local, origin-centered cm coordinate (e.g. from
// BUTIA_BOT_SPEC.chassis/sensorMounts, range -side/2..side/2) into a percent
// position on the illustration's shared 0-100 viewBox. Ratio-based (not tied
// to any specific chassis size), and shared by both axes with no flip: the
// illustration maps sim x/y to left/top directly (front, at sim y<0, sits
// near top:0%).
function cmToViewboxPct(cm: number, chassisSideCm: number): number {
    return ((cm + chassisSideCm / 2) / chassisSideCm) * 100
}

// The chassis square always fills the illustration's 0-100 viewBox exactly
// (cmToViewboxPct(-side/2, side) = 0, cmToViewboxPct(side/2, side) = 100), so
// only the corner radius needs converting to viewBox units — the rect itself
// is a constant x=0 y=0 width=100 height=100. Renders true rounded corners
// (SVG `rx`), unlike the sim's collider (an 8-vertex faceted approximation,
// capped by Planck's polygon vertex limit) — visual-only, no physics tie.
export function chassisCornerRadiusPct(sideCm: number, cornerRadiusCm: number): number {
    return (cornerRadiusCm / sideCm) * 100
}

// Converts a mount's chassis-local cm position (BUTIA_BOT_SPEC.sensorMounts)
// into the illustration's `top`/`left` CSS percentages, using the same
// cm->% mapping as chassisCornerRadiusPct so mount dots always land exactly on
// the chassis outline they're drawn over.
export function mountPreviewPos(pos: Vec2Like, chassisSideCm: number): { top: string; left: string } {
    return {
        top: `${cmToViewboxPct(pos.y, chassisSideCm)}%`,
        left: `${cmToViewboxPct(pos.x, chassisSideCm)}%`,
    }
}

// Draws the cone as a circular-sector polygon (apex + arc points) directly
// in the chassis illustration's shared 0-100 viewBox (apex at the mount's
// own position, not a fixed local center) so its length scales with the
// sensor's real maxRange, at the same units/cm as the rest of the
// illustration (PREVIEW_UNITS_PER_CM) — matching how buildSonarVisuals
// scales the sim's cone by maxRange * RENDER_SCALE. facingDeg follows the
// same clockwise-positive, 0=up(-y) convention as BUTIA_BOT_SPEC.sensorMounts
// (see ChassisIllustration).
//
// The arc boundary (rather than a straight-edge triangle to the two corner
// points) is required, not cosmetic: a straight edge sits at distance
// `length * cos(halfSpread)` from the apex along the center axis, so a
// wider spread would visually shrink the cone's reach even though rangeCm
// never changed. A true arc keeps every point on the boundary at exactly
// `length` from the apex regardless of spread, matching both the sim's own
// cone visuals (sonarVisuals.ts's `gfx.arc`) and the actual detection
// geometry (coneContactSensor.ts's `appoximateArc`, now shared via
// shared/geometry.ts) — so the preview never implies a range change that the
// real sensor doesn't have.
const ARC_SEGMENTS = 8

export function coneWedgePoints(apex: { x: number; y: number }, facingDeg: number, spreadDeg: number, rangeCm: number): string {
    const clampedSpread = Math.min(Math.max(spreadDeg, 1), 180)
    const halfDeg = clampedSpread / 2
    const length = rangeCm * PREVIEW_UNITS_PER_CM

    // -90 offset matches the same convention already used in
    // coneContactSensor.buildCone and sonarVisuals's upRad (0=+X
    // clockwise-positive, facingDeg 0=up/-y).
    const arc = appoximateArc(apex, length, facingDeg - halfDeg - 90, facingDeg + halfDeg - 90, ARC_SEGMENTS)
    const arcPoints = arc.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)

    return [`${apex.x},${apex.y}`, ...arcPoints].join(" ")
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
