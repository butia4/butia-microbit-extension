import { useState } from "react"
import { UseFormRegister, UseFormSetValue } from "react-hook-form"
import { useSelector } from "react-redux"
import { MountSide } from "../../../botSpecs/botSpec"
import { BUTIA_BOT_SPEC, BUTIA_V2_BOT_SPEC } from "../../../botSpecs/butiaBotSpec"
import { RootState } from "../../../redux/store"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import {
    ANGLE_MAX, ANGLE_MIN, DEFAULT_ANGLE, DEFAULT_DIRECTION, DEFAULT_RANGE, DIRECTION_MAX, DIRECTION_MIN, MOUNT_LABELS, RANGE_MAX, RANGE_MIN,
} from "../constants"

type SensorMountRowProps = {
    side: MountSide
    register: UseFormRegister<PinSettingsFormValues>
    setValue: UseFormSetValue<PinSettingsFormValues>
    isConnected: boolean
    isForward: boolean
    angle: number
    direction: number
    range: number
}

type BarNumberFieldProps = {
    id: string
    label: string
    value: number
    min: number
    max: number
    onChange: (value: number) => void
}

function BarNumberField({ id, label, value, min, max, onChange }: BarNumberFieldProps) {
    // NaN (cleared field) is ignored rather than clamped, so digits can be deleted mid-edit
    const handleChange = (raw: number): void => {
        if (Number.isNaN(raw)) return
        onChange(Math.min(Math.max(raw, min), max))
    }

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
                    onChange={(e) => handleChange(e.target.valueAsNumber)}
                    className="h-8 w-16 rounded-lg border-2 border-(--butia-green-100) bg-white px-2 text-xs font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                />
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => handleChange(e.target.valueAsNumber)}
                className="h-2 w-full cursor-pointer accent-(--butia-green-600)"
            />
        </div>
    )
}

export function SensorMountRow({ side, register, setValue, isConnected, isForward, angle, direction, range }: SensorMountRowProps) {
    const selectId = `pin-settings-${side}`
    const modeId = `sensor-mode-${side}`
    const angleId = `sensor-angle-${side}`
    const directionId = `sensor-direction-${side}`
    const rangeId = `sensor-range-${side}`
    const optionsId = `sensor-options-${side}`

    const [isExpanded, setIsExpanded] = useState(true)
    const model = useSelector((state: RootState) => state.robotModel.current)
    const connectorOptions = (model === "butiaV2" ? BUTIA_V2_BOT_SPEC : BUTIA_BOT_SPEC).connectorSlots

    return (
        <li className="flex flex-col gap-2 border-b border-(--butia-green-100) pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={selectId} className="text-sm font-medium text-(--butia-ink-900)">
                    {MOUNT_LABELS[side]}
                </label>
                <div className="flex items-center gap-2">
                    <select
                        id={selectId}
                        autoComplete="off"
                        {...register(`mounts.${side}.connector`)}
                        className="h-9 min-w-11 cursor-pointer rounded-lg border-2 border-(--butia-green-100) bg-white px-2 text-sm font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                    >
                        <option value="">Ninguno</option>
                        {connectorOptions.map((slot) => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                    {isConnected && (
                        <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={optionsId}
                            aria-label={isExpanded ? "Contraer opciones del sensor" : "Expandir opciones del sensor"}
                            onClick={() => setIsExpanded((prev) => !prev)}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-2 border-(--butia-green-100) bg-white text-(--butia-green-800) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {isConnected && isExpanded && (
                <div id={optionsId} className="flex flex-col gap-3">
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

                    {isForward && (
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
                            <BarNumberField
                                id={rangeId}
                                label="Alcance (cm)"
                                value={range}
                                min={RANGE_MIN}
                                max={RANGE_MAX}
                                onChange={(value) => setValue(`mounts.${side}.range`, value, { shouldValidate: true })}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setValue(`mounts.${side}.angle`, DEFAULT_ANGLE, { shouldValidate: true })
                                    setValue(`mounts.${side}.direction`, DEFAULT_DIRECTION, { shouldValidate: true })
                                    setValue(`mounts.${side}.range`, DEFAULT_RANGE, { shouldValidate: true })
                                }}
                                className="h-8 cursor-pointer self-start rounded-lg border-2 border-(--butia-green-100) bg-white px-3 text-xs font-semibold text-(--butia-green-800) shadow-sm transition-colors hover:border-(--butia-green-600) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                            >
                                Restablecer valores
                            </button>
                        </div>
                    )}
                </div>
            )}
        </li>
    )
}
