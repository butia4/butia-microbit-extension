import { useEffect, useRef, useState } from "react"
import { Simulation } from "../sim"
import { BUTIA_BOT_SPEC } from "../botSpecs/butiaBotSpec"
import { init as initMakeCode, sendSensors } from "./makecodeService"
import { ButiaStateMsg, ButiaMapSelectMsg } from "./protocol"
import { resolveMap } from "../maps/registry"
import { MapSpec } from "../maps/mapSpec"
import store from "../redux/store"
import { hydrateMapSettings } from "../redux/mapSettingsHydration"

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

export function useSimulatorLifecycle(): UseSimulatorLifecycleResult {
    const armedRef = useRef(false)
    const [armed, setArmed] = useState(false)
    const currentRunIdRef = useRef<string | undefined>(undefined)
    const lastArmedMapSpecRef = useRef<MapSpec | null>(null)
    const rearmOnSettingsCloseRef = useRef<() => void>(() => {})

    useEffect(() => {
        const sim = Simulation.instance

        const disarm = (): void => {
            if (!armedRef.current) return
            armedRef.current = false
            setArmed(false)
            // must clear(), not just stop(): Simulation.loop runs independently of
            // React and would crash calling sync() on entities spawnBot() left orphaned
            sim.stop()
            sim.clear()
        }

        const handleMapSelect = async (msg: ButiaMapSelectMsg): Promise<void> => {
            if (armedRef.current) return
            const mapSpec = resolveMap(msg.id)
            if (!mapSpec) return

            store.dispatch(hydrateMapSettings(msg.id))
            const { pinAssignment, sensorSettings } = store.getState()
            const ports = pinAssignment[msg.id]
            const settings = sensorSettings[msg.id]

            await sim.ready
            if (armedRef.current) return

            armedRef.current = true
            lastArmedMapSpecRef.current = mapSpec
            sim.loadMap(mapSpec)
            sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, settings)
            sim.start()
            setArmed(true)
        }
        const rearmOnSettingsClose = (): void => {
            if (!armedRef.current) return
            const mapSpec = lastArmedMapSpecRef.current
            if (!mapSpec) return

            const { currentMap, pinAssignment, sensorSettings } = store.getState()
            const ports = pinAssignment[currentMap.mapId]
            const settings = sensorSettings[currentMap.mapId]
            sim.stop()
            sim.clear()
            sim.loadMap(mapSpec)
            sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, settings)
            sim.start()
        }
        rearmOnSettingsCloseRef.current = rearmOnSettingsClose

        const stopMakeCode = initMakeCode({
            onState: (msg) => {
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
