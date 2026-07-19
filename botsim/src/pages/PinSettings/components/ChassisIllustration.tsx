import { ALL_MOUNT_SIDES, MountSide } from "../../../botSpecs/botSpec"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { MOUNT_FACING_DEG, MOUNT_ORDER, MOUNT_PREVIEW_POS } from "../constants"
import { coneWedgePoints } from "../utils/geometry"

type ChassisIllustrationProps = {
    mounts: Record<MountSide, PinSettingsFormValues["mounts"][MountSide]>
}

// Colors/proportions mirror the real chassis+wheel rendering
// (Chassis.makeShapeSpec, Wheel.makeShapeSpec, butiaBotSpec): flat fill, thin
// dark border, near-square chamfered corners (not a rounded-rect), and
// wheels protruding past the side edges toward the rear. The illustration
// maps sim x/y to left/top with no flip (front, at sim y=-5, sits at top:0%;
// rear, at y=+5, sits at top:100%), so MOUNT_FACING_DEG's sim-space rotation
// convention (0=up/-y, clockwise-positive) applies directly to the cone
// preview's CSS rotate() below. The 6 dots mirror each mount's connector
// state (filled+connector code = wired, hollow = "no configurado"); actual
// connector selection lives in SensorMountRow, this is read-only
// at-a-glance feedback.
export function ChassisIllustration({ mounts }: ChassisIllustrationProps) {
    return (
        <div className="relative flex h-40 w-40 items-center justify-center" aria-hidden="true">
            {/* roundedSquareVerts (chassis.ts) chamfers each corner with a
                single straight segment spanning cornerRadius (1.2cm) on a
                10cm side — a 12%-per-corner octagon cut, not a curve. An
                SVG polygon reproduces that exactly; a CSS border-radius
                would render a curved corner the sim never draws. */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 z-0 h-full w-full drop-shadow-[0_4px_14px_rgba(51,105,30,0.25)]"
                aria-hidden="true"
            >
                <polygon
                    points="12,0 88,0 100,12 100,88 88,100 12,100 0,88 0,12"
                    fill="#A3D977"
                    stroke="#555555"
                    strokeWidth="1.5"
                />
            </svg>
            <div className="absolute top-1/2 -left-3 z-0 h-16 w-5 border border-black/40 bg-[#212738]" />
            <div className="absolute top-1/2 -right-3 z-0 h-16 w-5 border border-black/40 bg-[#212738]" />

            {/* Positioned (relative) + z-10 so it paints above the
                absolutely-positioned chassis SVG — non-positioned elements
                always sit below positioned siblings regardless of DOM order,
                which is why this was invisible once the chassis became an
                <svg>. */}
            <img className="relative z-10 h-3/5 w-3/5 object-contain" src="assets/logo.svg" alt="" />

            {/* Live cone preview — only for connected mounts in "forward"
                mode, rotated to mount.direction (added onto the mount's
                fixed facingDeg, same composition as sim/bot/index.ts's
                effectiveFacingDeg) and widened to mount.angle, so tuning
                either field in SensorMountRow visibly moves/resizes this
                shape. */}
            {ALL_MOUNT_SIDES.map((side) => {
                const mount = mounts[side]
                if (mount.connector === "" || mount.mode !== "forward") return null
                const facingDeg = MOUNT_FACING_DEG[side] + mount.direction
                return (
                    <svg
                        key={`cone-${side}`}
                        viewBox="0 0 64 64"
                        className="pointer-events-none absolute z-[15] h-16 w-16"
                        style={{
                            top: MOUNT_PREVIEW_POS[side].top,
                            left: MOUNT_PREVIEW_POS[side].left,
                            transform: `translate(-50%, -50%) rotate(${facingDeg}deg)`,
                            transformOrigin: "50% 50%",
                        }}
                        aria-hidden="true"
                    >
                        <polygon points={coneWedgePoints(mount.angle)} fill="var(--butia-green-800)" fillOpacity="0.3" />
                    </svg>
                )
            })}

            {MOUNT_ORDER.map((side) => {
                const connector = mounts[side].connector
                const configured = connector !== ""
                return (
                    <div
                        key={side}
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        style={{ top: MOUNT_PREVIEW_POS[side].top, left: MOUNT_PREVIEW_POS[side].left }}
                    >
                        <div
                            className={
                                configured
                                    ? "flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--butia-green-800)] px-1 text-[0.6rem] font-bold text-white shadow-sm"
                                    : "h-3 w-3 rounded-full border-2 border-dashed border-white/80 bg-black/10"
                            }
                        >
                            {configured ? connector : null}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
