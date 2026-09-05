import { ReactNode } from "react"
import { useSelector } from "react-redux"
import CloseBtn from "./CloseBtn"
import { RootState } from "../redux/store"

interface LayoutProps {
    showSettingsButton: boolean
    onOpenSettings: () => void
    children: ReactNode
}

export function Layout({ showSettingsButton, onOpenSettings, children }: LayoutProps) {
    const model = useSelector((state: RootState) => state.robotModel.current)
    return (
        <div
            data-robot-model={model}
            className="flex m-0 p-0 w-full h-full items-center justify-center"
            style={{ width: "100vw", height: "100vh" }}
        >
            <div className="relative" style={{ width: "min(100vw, 100vh)", height: "min(100vw, 100vh)" }}>
                {showSettingsButton && <CloseBtn onOpenSettings={onOpenSettings} />}
                <div className="h-full w-full min-h-0 overflow-hidden rounded-tl-[6%_7%] rounded-tr-[6%_7%] rounded-bl-[7%_6%] rounded-br-[7%_6%]">
                    {children}
                </div>
            </div>
        </div>
    )
}
