import { useState } from "react"
import { ConnectorSlot } from "../botSpecs/botSpec"
import { PinAssignment, getPinAssignment, setPinAssignment, DEFAULT_PIN_ASSIGNMENT } from "../settings/pinAssignmentStore"

const CONNECTOR_OPTIONS: ConnectorSlot[] = ["J1", "J2", "J3", "J4", "J5"]

type PinSettingsProps = {
    onClose: () => void
}

// Settings screen: a static "big robot" illustration (approximating the
// chassis proportions from butiaBotSpec) with each frontal mount marker
// doubling as its own J1-J5 selector — a native <select> is positioned
// directly on top of the marker so clicking the marker opens the connector
// choice right there, instead of a disconnected side-panel list. Native
// <select> keeps this keyboard-accessible for free. Changes only take effect
// on the next arm/spawn — see design decision "apply at next arm, not live".
export function PinSettings({ onClose }: PinSettingsProps) {
    const initial: PinAssignment = getPinAssignment() ?? DEFAULT_PIN_ASSIGNMENT
    const [left, setLeft] = useState<ConnectorSlot>(initial.left)
    const [right, setRight] = useState<ConnectorSlot>(initial.right)
    const [error, setError] = useState<string | null>(null)

    // Selecting a connector only updates local (unsaved) state — persistence
    // happens exclusively on "Guardar", and only when validation passes.
    const handleLeftChange = (slot: ConnectorSlot): void => {
        setLeft(slot)
    }

    const handleRightChange = (slot: ConnectorSlot): void => {
        setRight(slot)
    }

    const handleSave = (): void => {
        const result = setPinAssignment({ left, right })
        if (!result.ok) {
            setError(result.error)
            return
        }
        setError(null)
        onClose()
    }

    return (
        <div className="butia-screen-transition flex h-full w-full flex-wrap content-center items-center justify-center gap-8 p-4 font-[var(--font-body)] text-[var(--butia-ink-900)]">
            <div className="flex shrink-0 items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl border-[3px] border-[var(--butia-green-600)] bg-gradient-to-b from-[var(--butia-green-100)] to-[var(--butia-green-300)] shadow-[0_4px_14px_rgba(51,105,30,0.25)]">
                    <img className="h-3/5 w-3/5 object-contain" src="assets/logo.svg" alt="" />

                    <label className="absolute -bottom-6 left-[20%] flex -translate-x-1/2 flex-col items-center gap-1">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--butia-green-800)] shadow-sm">
                            Izquierdo
                        </span>
                        <select
                            aria-label="Conector del montaje izquierdo"
                            value={left}
                            autoComplete="off"
                            onChange={(e) => handleLeftChange(e.target.value as ConnectorSlot)}
                            className="h-9 min-w-[44px] cursor-pointer appearance-none rounded-full border-2 border-white bg-[var(--butia-green-600)] px-2 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-[var(--butia-green-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                        >
                            {CONNECTOR_OPTIONS.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="absolute -bottom-6 right-[20%] flex translate-x-1/2 flex-col items-center gap-1">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--butia-green-800)] shadow-sm">
                            Derecho
                        </span>
                        <select
                            aria-label="Conector del montaje derecho"
                            value={right}
                            autoComplete="off"
                            onChange={(e) => handleRightChange(e.target.value as ConnectorSlot)}
                            className="h-9 min-w-[44px] cursor-pointer appearance-none rounded-full border-2 border-white bg-[var(--butia-green-600)] px-2 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-[var(--butia-green-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                        >
                            {CONNECTOR_OPTIONS.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <div className="flex max-w-xs flex-col gap-3 rounded-xl border border-[var(--butia-green-100)] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                <h2 className="m-0 font-[var(--font-display)] text-lg font-semibold text-[var(--butia-green-800)]">
                    Configuración de sensores
                </h2>
                <p className="m-0 text-sm text-[var(--butia-ink-500)]">
                    Hacé clic en un montaje del robot para elegir qué conector (J1-J5) lo alimenta.
                </p>

                {error && (
                    <p className="m-0 text-sm font-semibold text-[var(--butia-error)]" role="alert">
                        {error}
                    </p>
                )}

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
