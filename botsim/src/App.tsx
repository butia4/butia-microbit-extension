import { Layout } from "./layout/Layout"
import { SimContainer } from "./pages/SimContainer"
import { Placeholder } from "./pages/Placeholder"
import { PinSettings } from "./pages/PinSettings"
import { useBotSimContext } from "./context/botsim.context"

export function App() {
    const { armed, rearmOnSettingsClose, settingsOpen, setSettingsOpen } = useBotSimContext()

    return (
        <Layout showSettingsButton={!settingsOpen} onOpenSettings={() => setSettingsOpen(true)}>
            {settingsOpen ? (
                <PinSettings
                    key="settings"
                    onClose={() => {
                        setSettingsOpen(false)
                        rearmOnSettingsClose()
                    }}
                />
            ) : armed ? (
                <SimContainer key="sim" />
            ) : (
                <Placeholder key="placeholder" />
            )}
        </Layout>
    )
}
