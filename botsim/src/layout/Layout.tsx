import { ReactNode } from "react"

interface LayoutProps {
    showSettingsButton: boolean
    onOpenSettings: () => void
    children: ReactNode
}

// The whole simulator (map, settings screen, placeholder) is forced to a
// 1:1 aspect ratio regardless of the host MakeCode iframe's actual shape.
// `min(100vw, 100vh)` on both axes is the CSS-only way to fit the largest
// possible square inside a viewport of arbitrary proportions, letterboxed
// by the centering flex parent — no JS resize observer needed.
export function Layout({ showSettingsButton, onOpenSettings, children }: LayoutProps) {
    return (
        <div className="flex m-0 p-0 w-full h-full items-center justify-center" style={{ width: "100vw", height: "100vh" }}>
            <div className="relative" style={{ width: "min(100vw, 100vh)", height: "min(100vw, 100vh)" }}>
                {showSettingsButton && (
                    <button
                        type="button"
                        className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--butia-green-100)] bg-[var(--butia-green-50)] text-2xl leading-none shadow-[0_2px_6px_rgba(0,0,0,0.15)] cursor-pointer transition-transform duration-150 hover:scale-105 hover:bg-[var(--butia-green-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--butia-green-800)]"
                        onClick={onOpenSettings}
                        aria-label="Abrir configuración"
                        title="Configuración de sensores"
                    >
                        ⚙
                    </button>
                )}
                <div className="h-full w-full min-h-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
