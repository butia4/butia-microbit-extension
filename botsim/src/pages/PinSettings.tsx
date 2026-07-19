import { useState } from "react"
import { ALL_MOUNT_SIDES, ConnectorSlot, MountSide } from "../botSpecs/botSpec"
import { PinAssignment, getPinAssignment, setPinAssignment, DEFAULT_PIN_ASSIGNMENT } from "../settings/pinAssignmentStore"
import {
    SensorMode, SensorSettings, SensorMountSetting,
    getSensorSettings, setSensorSettings, DEFAULT_SENSOR_SETTINGS,
} from "../settings/sensorSettingsStore"

const CONNECTOR_OPTIONS: ConnectorSlot[] = ["J1", "J2", "J3", "J4", "J5"]

const UNSET = ""
type RowValue = ConnectorSlot | typeof UNSET

// Local, always-populated per-mount sensor row state — kept distinct from
// the persisted SensorMountSetting so angle/direction survive a mode switch
// away from "forward" and back (per spec's "Values persist across mode
// switches"), instead of being reset/dropped when mode is "surface" and
// those fields are hidden.
type SensorRowState = {
    mode: SensorMode
    angle: number
    direction: number
}

const DEFAULT_ANGLE = 45
const DEFAULT_DIRECTION = 0

// Sim-space facingDeg per mount (mirrors butiaBotSpec's sensorMounts):
// 0 = front (local -y), 90 = right, -90 = left, 180 = rear, clockwise-
// positive. The settings-screen illustration maps sim x/y to left/top with
// no flip, so this same convention drives the cone preview's rotation.
const MOUNT_FACING_DEG: Record<MountSide, number> = {
    frontLeft: 0,
    frontRight: 0,
    sideLeft: -90,
    sideRight: 90,
    rearLeft: 180,
    rearRight: 180,
}

// Cone preview geometry, in the local 64x64 viewBox each mount's SVG uses
// (see render below) — apex at the box center (32,32), pointing toward
// (32,0) i.e. "up"/local -y before rotation, matching MOUNT_FACING_DEG's
// 0deg. Length is a fixed decorative distance, not to scale with the sim's
// actual sensor maxRange.
const CONE_LENGTH = 30

function coneWedgePoints(spreadDeg: number): string {
    const clampedSpread = Math.min(Math.max(spreadDeg, 1), 180)
    const halfRad = (clampedSpread / 2) * (Math.PI / 180)
    const cx = 32
    const cy = 32
    const leftX = cx - CONE_LENGTH * Math.sin(halfRad)
    const leftY = cy - CONE_LENGTH * Math.cos(halfRad)
    const rightX = cx + CONE_LENGTH * Math.sin(halfRad)
    const rightY = cy - CONE_LENGTH * Math.cos(halfRad)
    return `${cx},${cy} ${leftX.toFixed(1)},${leftY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}`
}

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

function toSensorRowState(settings: SensorSettings): Record<MountSide, SensorRowState> {
    const rows = {} as Record<MountSide, SensorRowState>
    for (const side of MOUNT_ORDER) {
        const cfg = settings[side]
        rows[side] = {
            mode: cfg?.mode ?? "surface",
            angle: cfg?.angle ?? DEFAULT_ANGLE,
            direction: cfg?.direction ?? DEFAULT_DIRECTION,
        }
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
    const initialSensorSettings: SensorSettings = getSensorSettings() ?? DEFAULT_SENSOR_SETTINGS
    const [rows, setRows] = useState<Record<MountSide, RowValue>>(() => toRowState(initial))
    const [sensorRows, setSensorRows] = useState<Record<MountSide, SensorRowState>>(() => toSensorRowState(initialSensorSettings))
    const [error, setError] = useState<string | null>(null)

    // Selecting a connector only updates local (unsaved) state — persistence
    // happens exclusively on "Guardar", and only when validation passes.
    const handleRowChange = (side: MountSide, value: RowValue): void => {
        setRows(prev => ({ ...prev, [side]: value }))
    }

    // Updates one field of a mount's local sensor row state. Switching
    // "mode" alone never touches angle/direction/showCone — they stay in
    // local state so switching away from "forward" and back restores the
    // previously tuned values, per spec.
    const handleSensorRowChange = <K extends keyof SensorRowState>(side: MountSide, key: K, value: SensorRowState[K]): void => {
        setSensorRows(prev => ({ ...prev, [side]: { ...prev[side], [key]: value } }))
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

        const sensorSettings: SensorSettings = {}
        for (const side of MOUNT_ORDER) {
            const row = sensorRows[side]
            const setting: SensorMountSetting = rows[side] !== UNSET && row.mode === "forward"
                ? { mode: "forward", angle: row.angle, direction: row.direction }
                : { mode: "surface" }
            sensorSettings[side] = setting
        }
        const sensorResult = setSensorSettings(sensorSettings)
        if (!sensorResult.ok) {
            setError(sensorResult.error)
            return
        }

        setError(null)
        onClose()
    }

    // Discards any unsaved local changes and returns to the sim screen.
    // Safe as a no-op reset: onClose() re-reads pin/sensor settings from
    // their persisted stores (see App.tsx's rearmOnSettingsClose), never
    // from this component's local state, so nothing unsaved here leaks out.
    const handleCancel = (): void => {
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
                    edges toward the rear. The illustration maps sim x/y to
                    left/top with no flip (front, at sim y=-5, sits at top:0%;
                    rear, at y=+5, sits at top:100%), so MOUNT_FACING_DEG's
                    sim-space rotation convention (0=up/-y, clockwise-
                    positive) applies directly to the cone preview's CSS
                    rotate() below. The 6 dots mirror each row's connector
                    state (filled+connector code = wired, hollow = "no
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

                    {/* Live cone preview — only for connected mounts in
                        "forward" mode, rotated to sensorRow.direction (added
                        onto the mount's fixed facingDeg, same composition as
                        sim/bot/index.ts's effectiveFacingDeg) and widened to
                        sensorRow.angle, so tuning either field in the row
                        list below visibly moves/resizes this shape. */}
                    {MOUNT_ORDER.map((side) => {
                        const sensorRow = sensorRows[side]
                        if (rows[side] === UNSET || sensorRow.mode !== "forward") return null
                        const facingDeg = MOUNT_FACING_DEG[side] + sensorRow.direction
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
                                <polygon points={coneWedgePoints(sensorRow.angle)} fill="var(--butia-green-800)" fillOpacity="0.3" />
                            </svg>
                        )
                    })}

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
                        const modeId = `sensor-mode-${side}`
                        const angleId = `sensor-angle-${side}`
                        const directionId = `sensor-direction-${side}`
                        const sensorRow = sensorRows[side]
                        const isForward = sensorRow.mode === "forward"
                        const isConnected = rows[side] !== UNSET
                        return (
                            <li key={side} className="flex flex-col gap-2 border-b border-[var(--butia-green-100)] pb-2 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between gap-3">
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
                                </div>

                                {isConnected && (
                                    <div className="flex items-center justify-between gap-3">
                                        <label htmlFor={modeId} className="text-xs font-medium text-[var(--butia-ink-500)]">
                                            Modo del sensor
                                        </label>
                                        <select
                                            id={modeId}
                                            value={sensorRow.mode}
                                            autoComplete="off"
                                            onChange={(e) => handleSensorRowChange(side, "mode", e.target.value as SensorMode)}
                                            className="h-8 min-w-[44px] cursor-pointer rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-xs font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                                        >
                                            <option value="surface">Superficie</option>
                                            <option value="forward">Adelante</option>
                                        </select>
                                    </div>
                                )}

                                {isConnected && isForward && (
                                    <div className="flex flex-col gap-2 pl-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label htmlFor={angleId} className="text-xs font-medium text-[var(--butia-ink-500)]">
                                                Ángulo (°)
                                            </label>
                                            <input
                                                id={angleId}
                                                type="number"
                                                value={sensorRow.angle}
                                                onChange={(e) => handleSensorRowChange(side, "angle", Number(e.target.value))}
                                                className="h-8 w-20 rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-xs font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <label htmlFor={directionId} className="text-xs font-medium text-[var(--butia-ink-500)]">
                                                Dirección (°)
                                            </label>
                                            <input
                                                id={directionId}
                                                type="number"
                                                value={sensorRow.direction}
                                                onChange={(e) => handleSensorRowChange(side, "direction", Number(e.target.value))}
                                                className="h-8 w-20 rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-xs font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                                            />
                                        </div>
                                    </div>
                                )}
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
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="min-h-[44px] min-w-[44px] cursor-pointer rounded-lg border border-[var(--butia-green-100)] bg-white px-4 py-2 font-[var(--font-display)] text-sm font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:bg-[var(--butia-green-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
