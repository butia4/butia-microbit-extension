import { useState } from "react"
import { MOUNT_ORDER } from "../constants"
import { ChassisIllustration } from "./ChassisIllustration"
import { SensorMountRow } from "./SensorMountRow"
import { usePinSettingsForm } from "../hooks/usePinSettingsForm"

type PinSettingsProps = {
    onClose: () => void
}

export function PinSettings({ onClose }: PinSettingsProps) {
    const { form, errorMessage, onSubmit, onCancel } = usePinSettingsForm(onClose)
    const mounts = form.watch("mounts")

    const [isPanelOpen, setIsPanelOpen] = useState(true)

    return (
        <div className="butia-screen-transition relative flex h-full w-full items-center justify-center overflow-hidden rounded-tl-[6%_7%] rounded-tr-[6%_7%] rounded-bl-[7%_6%] rounded-br-[7%_6%] bg-(--butia-green-25) p-4 shadow-[inset_0_0_0_3px_var(--butia-green-100),inset_0_2px_12px_rgba(0,0,0,0.15)] font-(--font-body) text-(--butia-ink-900)">
            <div className="flex h-full flex-1 items-center justify-center">
                <ChassisIllustration mounts={mounts} />
            </div>

            {!isPanelOpen && (
                <button
                    type="button"
                    aria-label="Mostrar menú de configuración"
                    onClick={() => setIsPanelOpen(true)}
                    className="absolute right-0 top-1/2 z-20 flex h-16 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-lg border border-r-0 border-(--butia-green-100) bg-white text-(--butia-green-800) shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                >
                    «
                </button>
            )}

            <div
                className={`h-full shrink-0 overflow-hidden transition-[width,margin-left] duration-300 ease-in-out ${
                    isPanelOpen ? "ml-4 w-72" : "ml-0 w-0"
                }`}
            >
                <div
                    className={`z-20 flex h-full max-h-full w-72 min-h-0 flex-col gap-3 rounded-xl border border-(--butia-green-100) bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${
                        isPanelOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Ocultar menú de configuración"
                            onClick={() => setIsPanelOpen(false)}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-(--butia-green-100) bg-white text-(--butia-green-800) shadow-sm transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                        >
                            »
                        </button>
                        <h2 className="m-0 font-(--font-display) text-lg font-semibold text-(--butia-green-800)">
                            Configuración de sensores
                        </h2>
                    </div>
                    <p className="m-0 text-sm text-(--butia-ink-500)">
                        Elegí qué conector (J1-J5) alimenta cada montaje del robot, o dejalo en "Sin conector" si no tiene sensor.
                    </p>

                    {errorMessage && (
                        <p className="m-0 text-sm font-semibold text-(--butia-error)" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <ul className="butia-scroll m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-0 pr-1">
                        {MOUNT_ORDER.map((side) => (
                            <SensorMountRow
                                key={side}
                                side={side}
                                register={form.register}
                                setValue={form.setValue}
                                isConnected={mounts[side].connector !== ""}
                                isForward={mounts[side].mode === "forward"}
                                angle={mounts[side].angle}
                                direction={mounts[side].direction}
                                range={mounts[side].range}
                            />
                        ))}
                    </ul>

                    <div className="mt-1 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={onSubmit}
                            className="min-h-11 min-w-11 cursor-pointer rounded-lg border border-(--butia-green-800) bg-(--butia-green-600) px-4 py-2 font-(--font-display) text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--butia-green-800) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="min-h-11 min-w-11 cursor-pointer rounded-lg border border-(--butia-green-100) bg-white px-4 py-2 font-(--font-display) text-sm font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
