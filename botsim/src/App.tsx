import { Layout } from "./layout/Layout"
import { SimContainer } from "./pages/SimContainer"
import { MapNotSelected } from "./pages/MapNotSelected"
import { PinSettings } from "./pages/PinSettings"
import { useBotSimContext } from "./context/botsim.context"

export function App() {
    const { armed, rearmOnSettingsClose, settingsOpen, setSettingsOpen } = useBotSimContext()

    return (
        <Layout showSettingsButton={!settingsOpen && armed} onOpenSettings={() => setSettingsOpen(true)}>
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
                <MapNotSelected key="map-not-selected" />
            )}
        </Layout>
    )
}
