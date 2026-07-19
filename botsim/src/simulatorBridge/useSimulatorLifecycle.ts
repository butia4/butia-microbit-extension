import { useEffect, useRef, useState } from "react"
import { Simulation } from "../sim"
import { BUTIA_BOT_SPEC } from "../botSpecs/butiaBotSpec"
import { init as initMakeCode, sendSensors } from "./makecodeService"
import { ButiaStateMsg, ButiaMapSelectMsg } from "./protocol"
import { resolveMap } from "../maps/registry"
import { MapSpec } from "../maps/mapSpec"
import store from "../redux/store"

let currRunId: string | undefined

function handleState(msg: ButiaStateMsg): void {
    const sim = Simulation.instance

    if (currRunId !== msg.id) {
        currRunId = msg.id
        sim.reset(BUTIA_BOT_SPEC)
    }

    if (!sim.bot) return
    sim.bot.setMotors(msg.motorLeft, msg.motorRight)
    sim.bot.setSensorMap(msg.sensors)

    const values = sim.bot.readSensors()
    sendSensors(msg.id, values)
}

export type UseSimulatorLifecycleResult = {
    armed: boolean
    rearmOnSettingsClose: () => void
}

// Owns the MakeCode-bridge lifecycle: arming/disarming the simulator in
// response to "state"/"mapselect"/"stop"/"pause"/"resume" messages, and
// re-arming in place when the settings screen closes. Extracted verbatim
// from App.tsx so the page component stays a thin router.
export function useSimulatorLifecycle(): UseSimulatorLifecycleResult {
    const armedRef = useRef(false)
    const [armed, setArmed] = useState(false)
    // Tracks the run id ("state" msg.id) the sim is currently armed for, so a
    // new run (id change) or an explicit stop can re-hide the simulator until
    // a fresh "mapselect" message arrives for THAT run. Undefined means no
    // run has been observed yet.
    const currentRunIdRef = useRef<string | undefined>(undefined)
    // Remembers the map spec the sim is currently armed with, so closing the
    // settings screen can re-spawn the bot in place (with the freshest
    // persisted pin assignment) without waiting for a fresh "mapselect"
    // message — see rearmOnSettingsClose below. Undefined/null means no run
    // has ever been armed yet.
    const lastArmedMapSpecRef = useRef<MapSpec | null>(null)
    // Set inside the effect below (it needs `sim` + the closures above) but
    // invoked from the settings-close JSX handler, which lives outside that
    // effect's scope.
    const rearmOnSettingsCloseRef = useRef<() => void>(() => {})

    useEffect(() => {
        const sim = Simulation.instance

        const disarm = (): void => {
            if (!armedRef.current) return
            armedRef.current = false
            setArmed(false)
            // Stop the rAF loop and destroy all entities/bot now, not just
            // hide the UI. Simulation.loop keeps running independently of
            // React's tree — without this, it would keep calling
            // entity.renderObj.sync() every frame after SimContainer
            // unmounts, and a later handleMapSelect() would call spawnBot()
            // against a bot/entities left over from this run: spawnBot()
            // destroys the previous bot's render objects but never removes
            // them from Simulation's internal entities array (only clear()
            // does that), so the next loop tick crashes with "Cannot read
            // properties of null (reading 'position')" in RenderObject.sync.
            sim.stop()
            sim.clear()
        }

        const handleMapSelect = async (msg: ButiaMapSelectMsg): Promise<void> => {
            if (armedRef.current) return
            const mapSpec = resolveMap(msg.id)
            if (!mapSpec) return

            // Redux (persisted to localStorage) is the sole source of the
            // port assignment — applied at next arm/spawn, never mid-run.
            const { pinAssignment: ports, sensorSettings } = store.getState()

            // The renderer initializes asynchronously (Pixi v8) — wait for
            // it before touching anything that depends on the stage/canvas.
            await sim.ready
            if (armedRef.current) return

            // No extra clear() needed here: handleMapSelect only runs while
            // !armedRef.current, and the only ways to reach that state are
            // initial mount (entities already empty) or disarm() above
            // (which just cleared them) — so re-arming always starts from a
            // clean Simulation slate.
            armedRef.current = true
            lastArmedMapSpecRef.current = mapSpec
            sim.loadMap(mapSpec)
            sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, sensorSettings)
            sim.start()
            setArmed(true)
        }
        const rearmOnSettingsClose = (): void => {
            if (!armedRef.current) return
            const mapSpec = lastArmedMapSpecRef.current
            if (!mapSpec) return

            const { pinAssignment: ports, sensorSettings } = store.getState()
            sim.stop()
            sim.clear()
            sim.loadMap(mapSpec)
            sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, sensorSettings)
            sim.start()
        }
        rearmOnSettingsCloseRef.current = rearmOnSettingsClose

        const stopMakeCode = initMakeCode({
            onState: (msg) => {
                // A new run started (msg.id changed) without a mapselect for
                // it (yet) — go back to hidden/placeholder until one arrives.
                if (currentRunIdRef.current !== undefined && currentRunIdRef.current !== msg.id) {
                    disarm()
                }
                currentRunIdRef.current = msg.id

                if (!armedRef.current) return
                handleState(msg)
            },
            onMapSelect: handleMapSelect,
            onStop: () => disarm(),
            onPause: () => sim.pause(),
            onResume: () => sim.resume(),
        })

        return () => {
            stopMakeCode()
            sim.stop()
            sim.clear()
        }
    }, [])

    return {
        armed,
        rearmOnSettingsClose: () => rearmOnSettingsCloseRef.current(),
    }
}
