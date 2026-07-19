import { UseFormRegister } from "react-hook-form"
import { ALL_CONNECTOR_SLOTS, ConnectorSlot, MountSide } from "../../../botSpecs/botSpec"
import { PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { MOUNT_LABELS } from "../constants"

const CONNECTOR_OPTIONS: readonly ConnectorSlot[] = ALL_CONNECTOR_SLOTS

type SensorMountRowProps = {
    side: MountSide
    register: UseFormRegister<PinSettingsFormValues>
    isConnected: boolean
    isForward: boolean
}

// One mount's row: connector select always visible; mode select appears once
// a connector is chosen; angle/direction inputs appear only in "forward"
// mode. All four fields stay registered regardless of visibility (RHF's
// default shouldUnregister: false) so angle/direction survive a mode switch
// away from "forward" and back, instead of being reset/dropped.
export function SensorMountRow({ side, register, isConnected, isForward }: SensorMountRowProps) {
    const selectId = `pin-settings-${side}`
    const modeId = `sensor-mode-${side}`
    const angleId = `sensor-angle-${side}`
    const directionId = `sensor-direction-${side}`

    return (
        <li className="flex flex-col gap-2 border-b border-[var(--butia-green-100)] pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={selectId} className="text-sm font-medium text-[var(--butia-ink-900)]">
                    {MOUNT_LABELS[side]}
                </label>
                <select
                    id={selectId}
                    autoComplete="off"
                    {...register(`mounts.${side}.connector`)}
                    className="h-9 min-w-[44px] cursor-pointer rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-sm font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
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
                    <label htmlFor={modeId} className="text-xs font-medium text-[var(--butia-ink-500)]">
                        Modo del sensor
                    </label>
                    <select
                        id={modeId}
                        autoComplete="off"
                        {...register(`mounts.${side}.mode`)}
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
                            {...register(`mounts.${side}.angle`, { valueAsNumber: true })}
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
                            {...register(`mounts.${side}.direction`, { valueAsNumber: true })}
                            className="h-8 w-20 rounded-lg border-2 border-[var(--butia-green-100)] bg-white px-2 text-xs font-semibold text-[var(--butia-ink-900)] shadow-sm transition-colors hover:border-[var(--butia-green-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                        />
                    </div>
                </div>
            )}
        </li>
    )
}
