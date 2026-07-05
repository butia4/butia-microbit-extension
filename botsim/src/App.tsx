import { useEffect } from "react"
import "./App.css"
import { SimContainer } from "./ui/SimContainer"
import { Simulation } from "./sim"
import { DEFAULT_MAP } from "./maps/defaultMap"
import { BUTIA_BOT_SPEC } from "./bots/butiaBotSpec"
import { init as initMakeCode, sendSensors } from "./services/makecodeService"
import { ButiaStateMsg } from "./protocol"

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
    useEffect(() => {
        const sim = Simulation.instance
        sim.loadMap(DEFAULT_MAP)
        sim.spawnBot(BUTIA_BOT_SPEC)
        sim.start()

        const stopMakeCode = initMakeCode({
            onState: handleState,
            onStop: () => sim.stop(),
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
            <SimContainer />
        </div>
    )
}
