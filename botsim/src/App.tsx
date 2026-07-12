import { useEffect, useRef, useState } from "react"
import "./App.css"
import { SimContainer } from "./ui/SimContainer"
import { Placeholder } from "./ui/Placeholder"
import { Simulation } from "./sim"
import { BUTIA_BOT_SPEC } from "./bots/butiaBotSpec"
import { init as initMakeCode, sendSensors } from "./services/makecodeService"
import { ButiaStateMsg, ButiaMapSelectMsg } from "./protocol"
import { resolveMap } from "./maps/registry"
import { ConnectorSlot } from "./bots/specs"

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

export function App() {
    const armedRef = useRef(false)
    const [armed, setArmed] = useState(false)
    // Tracks the run id ("state" msg.id) the sim is currently armed for, so a
    // new run (id change) or an explicit stop can re-hide the simulator until
    // a fresh "mapselect" message arrives for THAT run. Undefined means no
    // run has been observed yet.
    const currentRunIdRef = useRef<string | undefined>(undefined)

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
            sim.loadMap(mapSpec)
            sim.spawnBot(BUTIA_BOT_SPEC, undefined, msg.leftPort as ConnectorSlot, msg.rightPort as ConnectorSlot)
            sim.start()
            setArmed(true)
        }

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

    return (
        <div className="app" style={{ width: "100vw", height: "100vh" }}>
            {armed ? <SimContainer /> : <Placeholder />}
        </div>
    )
}
