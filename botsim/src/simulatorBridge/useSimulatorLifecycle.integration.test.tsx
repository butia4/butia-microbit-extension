import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { Provider, useSelector } from "react-redux"
import { useSimulatorLifecycle } from "./useSimulatorLifecycle"
import { usePinSettingsForm } from "../pages/PinSettings/hooks/usePinSettingsForm"
import { TABLE_MAP } from "../maps/tableMap"
import { pinAssignmentKey, sensorSettingsKey } from "../redux/mapSlotPersistence"
import store, { RootState } from "../redux/store"
import type { ButiaMapSelectMsg } from "./protocol"

let capturedOnMapSelect: ((msg: ButiaMapSelectMsg) => void | Promise<void>) | undefined

vi.mock("./makecodeService", () => ({
    init: (opts: { onMapSelect?: (msg: ButiaMapSelectMsg) => void | Promise<void> }) => {
        capturedOnMapSelect = opts.onMapSelect
        return () => {}
    },
    sendSensors: vi.fn(),
}))

vi.mock("../sim", () => {
    const fakeSim = {
        ready: Promise.resolve(),
        bot: null,
        loadMap: vi.fn(),
        spawnBot: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        reset: vi.fn(),
    }
    return { Simulation: { instance: fakeSim } }
})

// Split across two components on purpose: in the real app, the settings
// dialog (which uses `usePinSettingsForm`) mounts AFTER a map has already
// been armed via the simulator bridge — it is not mounted throughout the
// transition. react-hook-form also only reads `defaultValues` once at
// mount, so re-rendering the same form instance would not reflect the
// hydration that happens after mount.
function LifecycleHarness() {
    useSimulatorLifecycle()
    return null
}

function FormHarness() {
    const { form } = usePinSettingsForm(() => {})
    const mapId = useSelector((state: RootState) => state.currentMap.mapId)

    return (
        <div>
            <span data-testid="mapId">{mapId}</span>
            <span data-testid="frontLeft">{form.getValues().mounts.frontLeft.connector}</span>
            <span data-testid="mode">{form.getValues().mounts.frontLeft.mode}</span>
        </div>
    )
}

describe("useSimulatorLifecycle + usePinSettingsForm integration", () => {
    beforeEach(() => {
        localStorage.clear()
        localStorage.setItem(pinAssignmentKey(TABLE_MAP.id), JSON.stringify({ frontLeft: "J1" }))
        localStorage.setItem(sensorSettingsKey(TABLE_MAP.id), JSON.stringify({ frontLeft: { mode: "forward" } }))
        capturedOnMapSelect = undefined
    })

    it("arms the just-selected map, then exposes its persisted settings to a freshly-opened pin settings form", async () => {
        render(
            <Provider store={store}>
                <LifecycleHarness />
            </Provider>,
        )

        expect(capturedOnMapSelect).toBeDefined()

        await act(async () => {
            await capturedOnMapSelect?.({ type: "mapselect", id: TABLE_MAP.id })
        })

        render(
            <Provider store={store}>
                <FormHarness />
            </Provider>,
        )

        expect(screen.getByTestId("mapId").textContent).toBe(String(TABLE_MAP.id))
        expect(screen.getByTestId("frontLeft").textContent).toBe("J1")
        expect(screen.getByTestId("mode").textContent).toBe("forward")
    })
})
