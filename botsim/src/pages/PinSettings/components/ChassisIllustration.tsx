import { ALL_MOUNT_SIDES, MountSide, SquareChassisSpec } from "../../../botSpecs/botSpec"
import { BUTIA_BOT_SPEC, BUTIA_CHASSIS_COLORS } from "../../../botSpecs/butiaBotSpec"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { MOUNT_ORDER } from "../constants"
import { chassisCornerRadiusPct, coneWedgePoints, mountPreviewPos } from "../utils/geometry"

const CHASSIS_SIDE_CM = (BUTIA_BOT_SPEC.chassis as SquareChassisSpec).side
const CHASSIS_CORNER_RADIUS_CM = (BUTIA_BOT_SPEC.chassis as SquareChassisSpec).cornerRadius

type ChassisIllustrationProps = {
    mounts: Record<MountSide, PinSettingsFormValues["mounts"][MountSide]>
}

// Colors/proportions mirror the real chassis+wheel rendering
// (Chassis.makeShapeSpec, Wheel.makeShapeSpec, butiaBotSpec) via a shared
// color source (BUTIA_CHASSIS_COLORS): flat fill, thin dark border, rounded
// corners, and wheels protruding past the side edges toward the rear. The illustration
// maps sim x/y to left/top with no flip (front, at sim y<0, sits near
// top:0%; rear, at y>0, sits near top:100%), so BUTIA_BOT_SPEC.sensorMounts'
// sim-space facingDeg convention (0=up/-y, clockwise-positive) applies
// directly to the cone preview's point rotation in coneWedgePoints below.
// The 6 dots mirror each mount's connector
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
        // a 160px box) and shrinks the whole thing uniformly via a `scale()`
        // transform instead of hand-scaling each fixed-px child (wheels,
        // cone previews, connector dots) individually.
        <div className="relative aspect-square w-32 shrink-0" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 flex h-40 w-40 origin-center -translate-x-1/2 -translate-y-1/2 items-center justify-center scale-[0.65]">
                {/* A plain div+border, not an SVG shape: CSS border-radius
                    draws a border of uniform thickness all the way around,
                    including the curve — an SVG `stroke` instead follows the
                    path length, so on a mostly-straight rounded-square outline
                    a thicker stroke reads as barely-thicker on the long
                    straight edges but visibly fatter on the short curved
                    corners. Renders true rounded corners — unlike the sim's
                    physics collider, which is a plain 4-vertex square (see
                    chassis.ts): at this scale the chamfer/rounding is
                    collision-negligible, so the collider stays sharp while
                    only the visuals round off. The sim's own
                    chassis mesh (Chassis.makeShapeSpec's cornerRadius brush
                    field, drawn via Pixi's roundRect in renderer.ts) matches
                    this same rounded look, so collider and visuals diverge
                    but the two visuals (preview + sim) stay in sync. */}
                <div
                    className="absolute inset-0 z-0 h-full w-full drop-shadow-[0_4px_14px_rgba(51,105,30,0.25)]"
                    style={{
                        backgroundColor: BUTIA_CHASSIS_COLORS.fill,
                        border: `4px solid ${BUTIA_CHASSIS_COLORS.border}`,
                        borderRadius: `${chassisCornerRadiusPct(CHASSIS_SIDE_CM, CHASSIS_CORNER_RADIUS_CM)}%`,
                    }}
                    aria-hidden="true"
                />
                <div className="absolute top-1/2 -left-4 z-0 h-15 w-4 border border-black/40 bg-[#212738]" />
                <div className="absolute top-1/2 -right-4 z-0 h-15 w-4 border border-black/40 bg-[#212738]" />

                {/* Positioned (relative) + z-10 so it paints above the
                    absolutely-positioned chassis SVG — non-positioned elements
                    always sit below positioned siblings regardless of DOM order,
                    which is why this was invisible once the chassis became an
                    <svg>. */}
                <img className="relative z-10 h-[70%] w-[70%] object-contain" src="assets/logo.svg" alt="" />

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
                        const mountSpec = BUTIA_BOT_SPEC.sensorMounts[side]
                        const facingDeg = (mountSpec.facingDeg ?? 0) + mount.direction
                        const previewPos = mountPreviewPos(mountSpec.pos, CHASSIS_SIDE_CM)
                        const apex = { x: parseFloat(previewPos.left), y: parseFloat(previewPos.top) }
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
                    const previewPos = mountPreviewPos(BUTIA_BOT_SPEC.sensorMounts[side].pos, CHASSIS_SIDE_CM)
                    return (
                        <div
                            key={side}
                            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                            style={{ top: previewPos.top, left: previewPos.left }}
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
