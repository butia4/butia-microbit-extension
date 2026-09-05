import { useState } from "react"
import { MOUNT_ORDER } from "../constants"
import { ChassisIllustration } from "./ChassisIllustration"
import { SensorMountRow } from "./SensorMountRow"
import { usePinSettingsForm } from "../hooks/usePinSettingsForm"
import { useStackedLayout } from "../hooks/useStackedLayout"
import { useIsFullscreenSim } from "../../../shared/hooks/useIsFullscreenSim"

type PinSettingsProps = {
    onClose: () => void
}

export function PinSettings({ onClose }: PinSettingsProps) {
    const { form, errorMessage, onSubmit, onCancel } = usePinSettingsForm(onClose)
    const mounts = form.watch("mounts")

    const [isPanelOpen, setIsPanelOpen] = useState(true)
    const { containerRef, firstItemRef, secondItemRef, isStacked } = useStackedLayout()
    const isFullscreenSim = useIsFullscreenSim()
    const isPanelVisible = isPanelOpen || isStacked

    console.log("PinSettingsPage render", { isPanelVisible, isStacked, isFullscreenSim })

    return (
        <div className="butia-screen-transition relative h-full w-full overflow-hidden bg-(--butia-green-25) font-(--font-body) text-(--butia-ink-900)">
            <div
                ref={containerRef}
                className={`butia-scroll flex h-full w-full flex-wrap content-stretch items-stretch justify-center overflow-x-hidden ${
                    isStacked ? "overflow-y-auto" : "overflow-y-hidden"
                }`}
            >
                <div
                    ref={firstItemRef}
                    className={`flex min-w-32 flex-1 items-center justify-center ${isStacked ? "m-8" : "m-4"}`}
                >
                    <ChassisIllustration mounts={mounts} />
                </div>

                {!isPanelVisible && (
                    <button
                        type="button"
                        aria-label="Mostrar menú de configuración"
                        onClick={() => setIsPanelOpen(true)}
                        className="absolute right-0 top-1/2 z-20 flex h-10 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-lg border border-r-0 border-(--butia-green-100) bg-white text-(--butia-green-800) shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                    >
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}

                <div
                    ref={secondItemRef}
                    className={`max-h-full flex min-w-0 shrink overflow-hidden transition-[flex-basis,max-width,margin-left] duration-300 ease-in-out ${
                        isPanelVisible ? "grow basis-72 max-w-72" : "ml-0 grow-0 basis-0 max-w-0"
                    } ${isStacked ? (isFullscreenSim ? "mb-8" : "mb-2") : ""}`}
                >
                    <div
                        className={`z-20 flex h-full w-full min-h-0 flex-col gap-3 rounded-xl border border-(--butia-green-100) bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${
                            isPanelVisible ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {!isStacked && (
                                <button
                                    type="button"
                                    aria-label="Ocultar menú de configuración"
                                    onClick={() => setIsPanelOpen(false)}
                                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-(--butia-green-100) bg-white text-(--butia-green-800) shadow-sm transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                                >
                                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            )}
                            <h2 className="m-0 font-(--font-display) text-lg font-semibold text-(--butia-green-800)">
                                Configuración de sensores
                            </h2>
                        </div>
                        {/* <p className="m-0 text-sm text-(--butia-ink-500)">
                            Elegí qué conector (J1-J6) alimenta cada montaje del robot, o dejalo en "Sin conector" si no tiene sensor.
                        </p> */}

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
                                className="h-max cursor-pointer rounded-lg border border-(--butia-green-800) bg-(--butia-green-600) px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--butia-green-800) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="h-max cursor-pointer rounded-lg border border-(--butia-green-100) bg-white px-4 py-2 text-sm font-semibold text-(--butia-ink-900) shadow-sm transition-colors hover:bg-(--butia-green-50) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
