import { ReactNode } from "react"
import CloseBtn from "./CloseBtn"

interface LayoutProps {
    showSettingsButton: boolean
    onOpenSettings: () => void
    children: ReactNode
}

export function Layout({ showSettingsButton, onOpenSettings, children }: LayoutProps) {
    return (
        <div className="flex m-0 p-0 w-full h-full items-center justify-center" style={{ width: "100vw", height: "100vh" }}>
            <div className="relative" style={{ width: "min(100vw, 100vh)", height: "min(100vw, 100vh)" }}>
                {showSettingsButton && (
                    <CloseBtn onOpenSettings={onOpenSettings} />
                )}
                <div className="h-full w-full min-h-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
