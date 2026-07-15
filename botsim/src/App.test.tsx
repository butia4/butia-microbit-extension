import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act } from "react"
import { createRoot, Root } from "react-dom/client"

// App wires handleMapSelect -> Simulation.spawnBot with the resolved
// left/right ports. These tests only care about *which* ports get passed to
// spawnBot, so Simulation, the map registry, and the pin assignment store are
// all mocked to lightweight stand-ins.
const spawnBot = vi.fn()
const loadMap = vi.fn()
const simulationInstance = {
    ready: Promise.resolve(),
    loadMap,
    spawnBot,
    start: vi.fn(),
    stop: vi.fn(),
    clear: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    mountTo: vi.fn(),
    bot: null,
}

vi.mock("./sim", () => ({
    Simulation: { instance: simulationInstance },
}))

vi.mock("./maps/registry", () => ({
    resolveMap: vi.fn(() => ({ id: 1 })),
}))

const getPinAssignment = vi.fn()
vi.mock("./settings/pinAssignmentStore", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./settings/pinAssignmentStore")>()
    return {
        ...actual,
        getPinAssignment: (...args: unknown[]) => getPinAssignment(...args),
    }
})

describe("App handleMapSelect port resolution", () => {
    let container: HTMLDivElement
    let root: Root

    beforeEach(() => {
        spawnBot.mockClear()
        loadMap.mockClear()
        getPinAssignment.mockReset()
        container = document.createElement("div")
        document.body.appendChild(container)
    })

    afterEach(() => {
        act(() => {
            root.unmount()
        })
        container.remove()
        vi.resetModules()
    })

    async function mountApp(): Promise<void> {
        const { App } = await import("./App")
        await act(async () => {
            root = createRoot(container)
            root.render(<App />)
        })
    }

    async function dispatchMapSelect(): Promise<void> {
        const msg = { type: "mapselect", id: 1 }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        await act(async () => {
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: { type: "messagepacket", channel: "butia4/butia-microbit-extension", data: data.buffer },
                })
            )
            await simulationInstance.ready
        })
    }

    it("uses the persisted override when present", async () => {
        getPinAssignment.mockReturnValue({ left: "J4", right: "J5" })
        await mountApp()
        await dispatchMapSelect()

        expect(spawnBot).toHaveBeenCalledWith(expect.anything(), undefined, "J4", "J5")
    })

    it("falls back to the default assignment when no override is persisted", async () => {
        getPinAssignment.mockReturnValue(null)
        await mountApp()
        await dispatchMapSelect()

        expect(spawnBot).toHaveBeenCalledWith(expect.anything(), undefined, "J1", "J2")
    })
})
