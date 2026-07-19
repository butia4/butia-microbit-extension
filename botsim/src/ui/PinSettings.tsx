import { useState } from "react"
import { ALL_MOUNT_SIDES, ConnectorSlot, MountSide } from "../botSpecs/botSpec"
import { PinAssignment, getPinAssignment, setPinAssignment, DEFAULT_PIN_ASSIGNMENT } from "../settings/pinAssignmentStore"

const CONNECTOR_OPTIONS: ConnectorSlot[] = ["J1", "J2", "J3", "J4", "J5"]

const UNSET = ""
type RowValue = ConnectorSlot | typeof UNSET

// ALL_MOUNT_SIDES's declared order (frontal, then lateral, then rear) already
// mirrors how a user reads the chassis illustration top-to-bottom, so the row
// list reuses it directly instead of hand-typing a second copy of the 6 mounts.
const MOUNT_ORDER: readonly MountSide[] = ALL_MOUNT_SIDES

const MOUNT_LABELS: Record<MountSide, string> = {
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
const MOUNT_PREVIEW_POS: Record<MountSide, { top: string; left: string }> = {
    frontLeft: { top: "0%", left: "20%" },
    frontRight: { top: "0%", left: "80%" },
    sideLeft: { top: "30%", left: "0%" },
    sideRight: { top: "30%", left: "100%" },
    rearLeft: { top: "100%", left: "20%" },
    rearRight: { top: "100%", left: "80%" },
}

type PinSettingsProps = {
    onClose: () => void
}

function toRowState(assignment: PinAssignment): Record<MountSide, RowValue> {
    const rows = {} as Record<MountSide, RowValue>
    for (const side of MOUNT_ORDER) {
        rows[side] = assignment[side] ?? UNSET
    }
    return rows
}

// Settings screen: a static "big robot" illustration (approximating the
// chassis proportions from butiaBotSpec, non-interactive — purely a "which
// mount is which" visual reference) plus a 6-row list below it, one row per
// physical sensor mount, each with a native <select> offering J1-J5 or "Sin
// conector" (unconfigured). Native <select> keeps this keyboard-accessible
// for free. Changes only take effect on the next arm/spawn — see design
// decision "apply at next arm, not live".
export function PinSettings({ onClose }: PinSettingsProps) {
    const initial: PinAssignment = getPinAssignment() ?? DEFAULT_PIN_ASSIGNMENT
    const [rows, setRows] = useState<Record<MountSide, RowValue>>(() => toRowState(initial))
    const [error, setError] = useState<string | null>(null)

    // Selecting a connector only updates local (unsaved) state — persistence
    // happens exclusively on "Guardar", and only when validation passes.
    const handleRowChange = (side: MountSide, value: RowValue): void => {
        setRows(prev => ({ ...prev, [side]: value }))
    }

    const handleSave = (): void => {
        const assignment: PinAssignment = {}
        for (const side of MOUNT_ORDER) {
            const value = rows[side]
            if (value !== UNSET) assignment[side] = value
        }
        const result = setPinAssignment(assignment)
        if (!result.ok) {
            setError(result.error)
            return
        }
        setError(null)
        onClose()
    }

    return (
        <div className="butia-screen-transition flex h-full w-full flex-wrap content-center items-center justify-center gap-8 overflow-hidden rounded-tl-[6%_7%] rounded-tr-[6%_7%] rounded-bl-[7%_6%] rounded-br-[7%_6%] bg-gradient-to-b from-[var(--butia-green-50)] to-[var(--butia-green-100)] p-4 shadow-[inset_0_0_0_3px_var(--butia-green-100),inset_0_2px_12px_rgba(0,0,0,0.15)] font-[var(--font-body)] text-[var(--butia-ink-900)]">
            <div className="flex shrink-0 items-center justify-center">
                {/* Colors/proportions mirror the real chassis+wheel rendering
                    (Chassis.makeShapeSpec, Wheel.makeShapeSpec, butiaBotSpec):
                    flat fill, thin dark border, near-square chamfered corners
                    (not a rounded-rect), and wheels protruding past the side
                    edges toward the rear. The illustration points "forward"
                    (sensor mounts) up, opposite the sim's own y-down/front
                    convention, purely for a more natural on-screen reading.
                    Static/non-interactive — the 6 dots below just mirror each
                    row's state (filled+connector code = wired, hollow = "no
                    configurado"); the actual connector selection lives in the
                    row list below, this is read-only at-a-glance feedback. */}
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
                        absolutely-positioned chassis SVG — non-positioned
                        elements always sit below positioned siblings
                        regardless of DOM order, which is why this was
                        invisible once the chassis became an <svg>. */}
                    <img className="relative z-10 h-3/5 w-3/5 object-contain" src="assets/logo.svg" alt="" />

                    {MOUNT_ORDER.map((side) => {
                        const value = rows[side]
                        const configured = value !== UNSET
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
                                    {configured ? value : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex max-w-xs flex-col gap-3 rounded-xl border border-[var(--butia-green-100)] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                <h2 className="m-0 font-[var(--font-display)] text-lg font-semibold text-[var(--butia-green-800)]">
                    Configuración de sensores
                </h2>
                <p className="m-0 text-sm text-[var(--butia-ink-500)]">
                    Elegí qué conector (J1-J5) alimenta cada montaje del robot, o dejalo en "Sin conector" si no tiene sensor.
                </p>

                {error && (
                    <p className="m-0 text-sm font-semibold text-[var(--butia-error)]" role="alert">
                        {error}
                    </p>
                )}

                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {MOUNT_ORDER.map((side) => {
                        const selectId = `pin-settings-${side}`
                        return (
                            <li key={side} className="flex items-center justify-between gap-3">
                                <label htmlFor={selectId} className="text-sm font-medium text-[var(--butia-ink-900)]">
                                    {MOUNT_LABELS[side]}
                                </label>
                                <select
                                    id={selectId}
                                    value={rows[side]}
                                    autoComplete="off"
                                    onChange={(e) => handleRowChange(side, e.target.value as RowValue)}
                                    className="h-9 min-w-[44px] cursor-pointer rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-sm font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                                >
                                    <option value={UNSET}>Sin conector</option>
                                    {CONNECTOR_OPTIONS.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-1 flex gap-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="min-h-[44px] min-w-[44px] cursor-pointer rounded-lg border border-[var(--butia-green-800)] bg-[var(--butia-green-600)] px-4 py-2 font-[var(--font-display)] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--butia-green-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}
