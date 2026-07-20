import { ALL_MOUNT_SIDES, MountSide } from "../../botSpecs/botSpec"

export const DEFAULT_ANGLE = 45
export const DEFAULT_DIRECTION = 0
export const DEFAULT_RANGE = 40

// Re-exported from botSpecs/sensorSettings.model (shared, not
// PinSettings-feature-scoped) since the persisted schema needs the same
// bounds as this settings screen's slider/number inputs — see that file for
// the rationale. Kept importable from here too so SensorMountRow/
// pinSettingsForm.model don't need to reach into botSpecs directly for a
// value that's conceptually part of this feature's UI constants.
export { ANGLE_MAX, ANGLE_MIN, DIRECTION_MAX, DIRECTION_MIN, RANGE_MAX, RANGE_MIN } from "../../botSpecs/sensorSettings.model"

// Cone preview geometry, expressed in the chassis illustration's own 0-100
// viewBox (see ChassisIllustration's chamfered-square <svg>). That viewBox's
// 0%..100% span was mapped from the bot's pre-scale (10cm-side) chassis
// coordinates -5..5cm, so 100 viewBox units = 10cm, i.e. 10 units/cm. Used
// to draw the cone preview to the same real-world scale as the sim's sonar
// cone (buildSonarVisuals), instead of a fixed decorative length — see
// coneWedgePoints. NOTE (pre-existing, out of scope): this is a fixed
// units/cm derived from the pre-scale 10cm-side chassis, while
// mountPreviewPos/chassisCornerRadiusPct (utils/geometry.ts) now map cm to %
// as a ratio of the *current* 8cm chassis side — the two no longer agree on
// units/cm, a latent scale mismatch flagged at design time and intentionally
// not fixed here.
export const PREVIEW_UNITS_PER_CM = 10

// ALL_MOUNT_SIDES's declared order (frontal, then lateral, then rear) already
// mirrors how a user reads the chassis illustration top-to-bottom, so the row
// list reuses it directly instead of hand-typing a second copy of the 6 mounts.
export const MOUNT_ORDER: readonly MountSide[] = ALL_MOUNT_SIDES

export const MOUNT_LABELS: Record<MountSide, string> = {
    frontLeft: "Delantero Izquierdo",
    frontRight: "Delantero Derecho",
    sideLeft: "Lateral Izquierdo",
    sideRight: "Lateral Derecho",
    rearLeft: "Trasero Izquierdo",
    rearRight: "Trasero Derecho",
}
