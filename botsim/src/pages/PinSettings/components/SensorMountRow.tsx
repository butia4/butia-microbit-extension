import { UseFormRegister, UseFormSetValue } from "react-hook-form"
import { ALL_CONNECTOR_SLOTS, ConnectorSlot, MountSide } from "../../../botSpecs/botSpec"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { MOUNT_LABELS } from "../constants"

const CONNECTOR_OPTIONS: readonly ConnectorSlot[] = ALL_CONNECTOR_SLOTS

// Cone opening width: 1 (needle-thin) to 180 (full half-circle) — mirrors
// the clamp coneWedgePoints applies when previewing this mount's cone.
const ANGLE_MIN = 1
const ANGLE_MAX = 180

// Rotation offset added onto the mount's base facing (see MOUNT_FACING_DEG)
// — a full turn either way.
const DIRECTION_MIN = -180
const DIRECTION_MAX = 180

type SensorMountRowProps = {
    side: MountSide
    register: UseFormRegister<PinSettingsFormValues>
    setValue: UseFormSetValue<PinSettingsFormValues>
    isConnected: boolean
    isForward: boolean
    angle: number
    direction: number
}

// Paired range + number control for one numeric field: both inputs are
// controlled off the same `value`/`onChange` so dragging the slider updates
// the number box live and vice versa (plain `register` on two separate
// uncontrolled inputs would let them drift out of sync).
type BarNumberFieldProps = {
    id: string
    label: string
    value: number
    min: number
    max: number
    onChange: (value: number) => void
}

function BarNumberField({ id, label, value, min, max, onChange }: BarNumberFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-xs font-medium text-(--butia-ink-500)">
                    {label}
                </label>
                <input
                    id={`${id}-number`}
                    aria-label={label}
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(e.target.valueAsNumber)}
                    className="h-8 w-16 rounded-lg border-2 border-(--butia-green-100) bg-white px-2 text-xs font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                />
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(e.target.valueAsNumber)}
                className="h-2 w-full cursor-pointer accent-(--butia-green-600)"
            />
        </div>
    )
}

// One mount's row: connector select always visible; mode select appears once
// a connector is chosen; angle/direction inputs appear only in "forward"
// mode. connector/mode stay registered regardless of visibility (RHF's
// default shouldUnregister: false); angle/direction are driven by setValue
// instead of register (see BarNumberField) but PinSettingsPage always passes
// their current watched value down, so they likewise survive a mode switch
// away from "forward" and back.
export function SensorMountRow({ side, register, setValue, isConnected, isForward, angle, direction }: SensorMountRowProps) {
    const selectId = `pin-settings-${side}`
    const modeId = `sensor-mode-${side}`
    const angleId = `sensor-angle-${side}`
    const directionId = `sensor-direction-${side}`

    return (
        <li className="flex flex-col gap-2 border-b border-(--butia-green-100) pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={selectId} className="text-sm font-medium text-(--butia-ink-900)">
                    {MOUNT_LABELS[side]}
                </label>
                <select
                    id={selectId}
                    autoComplete="off"
                    {...register(`mounts.${side}.connector`)}
                    className="h-9 min-w-11 cursor-pointer rounded-lg border-2 border-(--butia-green-100) bg-white px-2 text-sm font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                >
                    <option value="">Sin conector</option>
                    {CONNECTOR_OPTIONS.map((slot) => (
                        <option key={slot} value={slot}>
                            {slot}
                        </option>
                    ))}
                </select>
            </div>

            {isConnected && (
                <div className="flex items-center justify-between gap-3">
                    <label htmlFor={modeId} className="text-xs font-medium text-(--butia-ink-500)">
                        Modo del sensor
                    </label>
                    <select
                        id={modeId}
                        autoComplete="off"
                        {...register(`mounts.${side}.mode`)}
                        className="h-8 min-w-11 cursor-pointer rounded-lg border-2 border-(--butia-green-100) bg-white px-2 text-xs font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                    >
                        <option value="surface">Superficie</option>
                        <option value="forward">Adelante</option>
                    </select>
                </div>
            )}

            {isConnected && isForward && (
                <div className="flex flex-col gap-3 pl-2">
                    <BarNumberField
                        id={angleId}
                        label="Ángulo (°)"
                        value={angle}
                        min={ANGLE_MIN}
                        max={ANGLE_MAX}
                        onChange={(value) => setValue(`mounts.${side}.angle`, value, { shouldValidate: true })}
                    />
                    <BarNumberField
                        id={directionId}
                        label="Dirección (°)"
                        value={direction}
                        min={DIRECTION_MIN}
                        max={DIRECTION_MAX}
                        onChange={(value) => setValue(`mounts.${side}.direction`, value, { shouldValidate: true })}
                    />
                </div>
            )}
        </li>
    )
}
