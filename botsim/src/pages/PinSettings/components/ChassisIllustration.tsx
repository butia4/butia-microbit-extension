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

export function ChassisIllustration({ mounts }: ChassisIllustrationProps) {
    return (
        <div className="relative aspect-square w-32 shrink-0" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 flex h-40 w-40 origin-center -translate-x-1/2 -translate-y-1/2 items-center justify-center scale-[0.65]">
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

                <img className="relative z-10 h-[70%] w-[70%] object-contain" src="assets/logo.svg" alt="" />

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
                                        ? "flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-(--butia-green-800) px-1 text-2xs font-bold text-white shadow-sm"
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
