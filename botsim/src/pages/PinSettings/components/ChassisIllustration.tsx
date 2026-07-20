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
// preview's point rotation in coneWedgePoints below. The 6 dots mirror each
// mount's connector
// state (filled+connector code = wired, hollow = "no configurado"); actual
// connector selection lives in SensorMountRow, this is read-only
// at-a-glance feedback.
export function ChassisIllustration({ mounts }: ChassisIllustrationProps) {
    return (
        // Outer box reserves the final (scaled-down) square footprint in the
        // page's flex layout (aspect-square + shrink-0 so a `grow` flex
        // parent can't stretch/squish it off-square). The inner box is
        // `absolute` — fully out of flow, so its own 160px layout size (a
        // `scale()` transform repaints smaller but never changes the box's
        // layout size) can't feed back into the outer flex item's sizing.
        // It keeps every child's original size/position math (all tuned for
        // a 160px box) and shrinks the whole thing uniformly via
        // `scale-[0.8]` — matches BUTIA_BOT_SPEC's 0.8x chassis scale
        // instead of hand-scaling each fixed-px child (wheels, cone previews,
        // connector dots) individually.
        <div className="relative aspect-square w-32 shrink-0" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 flex h-40 w-40 origin-center -translate-x-1/2 -translate-y-1/2 items-center justify-center scale-[0.8]">
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
                    effectiveFacingDeg), widened to mount.angle, and drawn to
                    mount.range — the user-configured maxRange override that
                    sim/bot/index.ts applies to whichever sensor type ends up
                    reading this mount (LightSensor is the only one that also
                    shows a persistent cone in the sim itself — see
                    sim/bot/index.ts's showCone) — at the same real-world
                    scale as the chassis (see coneWedgePoints/
                    PREVIEW_UNITS_PER_CM), so this preview matches the sim's
                    cone size instead of a fixed decorative wedge. Shares the
                    chassis polygon's own 0-100 viewBox (not a separate
                    per-mount box) so the cone can extend past the chassis
                    silhouette without distorting — `overflow-visible` since
                    a cone can be several times the 8cm chassis and must be
                    allowed to draw outside it. */}
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-15 h-full w-full overflow-visible"
                    aria-hidden="true"
                >
                    {ALL_MOUNT_SIDES.map((side) => {
                        const mount = mounts[side]
                        if (mount.connector === "" || mount.mode !== "forward") return null
                        const facingDeg = MOUNT_FACING_DEG[side] + mount.direction
                        const apex = { x: parseFloat(MOUNT_PREVIEW_POS[side].left), y: parseFloat(MOUNT_PREVIEW_POS[side].top) }
                        return (
                            <polygon
                                key={`cone-${side}`}
                                points={coneWedgePoints(apex, facingDeg, mount.angle, mount.range)}
                                fill="var(--butia-green-800)"
                                fillOpacity="0.3"
                            />
                        )
                    })}
                </svg>

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
                                        ? "flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-(--butia-green-800) px-1 text-[0.6rem] font-bold text-white shadow-sm"
                                        : "h-3 w-3 rounded-full border-2 border-dashed border-white/80 bg-black/10"
                                }
                            >
                                {configured ? connector : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
