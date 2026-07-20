import { MOUNT_ORDER } from "../constants"
import { ChassisIllustration } from "./ChassisIllustration"
import { SensorMountRow } from "./SensorMountRow"
import { usePinSettingsForm } from "../hooks/usePinSettingsForm"

type PinSettingsProps = {
    onClose: () => void
}

// Settings screen: a static "big robot" illustration (approximating the
// chassis proportions from butiaBotSpec, non-interactive — purely a "which
// mount is which" visual reference) plus a 6-row list below it, one row per
// physical sensor mount, each with a native <select> offering J1-J5 or "Sin
// conector" (unconfigured). Native <select> keeps this keyboard-accessible
// for free. Changes only take effect on the next arm/spawn — see design
// decision "apply at next arm, not live".
export function PinSettings({ onClose }: PinSettingsProps) {
    const { form, errorMessage, onSubmit, onCancel } = usePinSettingsForm(onClose)
    const mounts = form.watch("mounts")

    return (
        <div className="butia-screen-transition flex h-full w-full flex-wrap content-center items-center justify-center overflow-hidden rounded-tl-[6%_7%] rounded-tr-[6%_7%] rounded-bl-[7%_6%] rounded-br-[7%_6%] bg-(--butia-green-25) p-4 shadow-[inset_0_0_0_3px_var(--butia-green-100),inset_0_2px_12px_rgba(0,0,0,0.15)] font-(--font-body) text-(--butia-ink-900)">
            <div className="flex grow items-center justify-center">
                <ChassisIllustration mounts={mounts} />
            </div>

            <div className="flex max-h-full min-h-0 max-w-xs flex-col gap-3 rounded-xl border border-(--butia-green-100) bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                <h2 className="m-0 font-(--font-display) text-lg font-semibold text-(--butia-green-800)">
                    Configuración de sensores
                </h2>
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
                        />
                    ))}
                </ul>

                <div className="mt-1 flex gap-3">
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
    )
}
