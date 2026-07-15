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
        <div className="pin-settings">
            <div className="pin-settings-robot">
                <div className="pin-settings-robot-chassis">
                    <img className="pin-settings-robot-logo" src="assets/logo.svg" alt="" />

                    <label className="pin-settings-robot-mount pin-settings-robot-mount-left">
                        <span className="pin-settings-robot-mount-label">Izquierdo</span>
                        <select
                            aria-label="Conector del montaje izquierdo"
                            value={left}
                            autoComplete="off"
                            onChange={(e) => handleLeftChange(e.target.value as ConnectorSlot)}
                        >
                            {CONNECTOR_OPTIONS.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="pin-settings-robot-mount pin-settings-robot-mount-right">
                        <span className="pin-settings-robot-mount-label">Derecho</span>
                        <select
                            aria-label="Conector del montaje derecho"
                            value={right}
                            autoComplete="off"
                            onChange={(e) => handleRightChange(e.target.value as ConnectorSlot)}
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

            <div className="pin-settings-controls">
                <h2>Configuración de sensores</h2>
                <p>Hacé clic en un montaje del robot para elegir qué conector (J1-J5) lo alimenta.</p>

                {error && (
                    <p className="pin-settings-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="pin-settings-actions">
                    <button type="button" onClick={handleSave}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}
