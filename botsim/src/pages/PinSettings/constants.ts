import { ALL_MOUNT_SIDES, MountSide } from "../../botSpecs/botSpec"

export const DEFAULT_ANGLE = 45
export const DEFAULT_DIRECTION = 0

// Sim-space facingDeg per mount (mirrors butiaBotSpec's sensorMounts):
// 0 = front (local -y), 90 = right, -90 = left, 180 = rear, clockwise-
// positive. The settings-screen illustration maps sim x/y to left/top with
// no flip, so this same convention drives the cone preview's rotation.
export const MOUNT_FACING_DEG: Record<MountSide, number> = {
    frontLeft: 0,
    frontRight: 0,
    sideLeft: -90,
    sideRight: 90,
    rearLeft: 180,
    rearRight: 180,
}

// Cone preview geometry, in the local 64x64 viewBox each mount's SVG uses
// (see ChassisIllustration) — apex at the box center (32,32), pointing
// toward (32,0) i.e. "up"/local -y before rotation, matching
// MOUNT_FACING_DEG's 0deg. Length is a fixed decorative distance, not to
// scale with the sim's actual sensor maxRange.
export const CONE_LENGTH = 30

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

// Marker position for each mount on the illustration, as a % of the chassis
// box — derived from butiaBotSpec's actual cm coordinates (chassis half=5cm,
// front={x:±3,y:-5}, side={x:±5,y:-2} (closer to front than rear), rear=
// {x:±3,y:5}), mapped the same way the chassis/wheels already are: x -5..5cm
// -> 0..100%, y flipped (front=up) since this illustration points
// forward-up while the sim's own convention is front=-y/"down" on screen.
// front top=0%/side edge top=30%/rear bottom top=100%.
export const MOUNT_PREVIEW_POS: Record<MountSide, { top: string; left: string }> = {
    frontLeft: { top: "0%", left: "20%" },
    frontRight: { top: "0%", left: "80%" },
    sideLeft: { top: "30%", left: "0%" },
    sideRight: { top: "30%", left: "100%" },
    rearLeft: { top: "100%", left: "20%" },
    rearRight: { top: "100%", left: "80%" },
}
