import { Simulation } from "../sim"
import { MAPS } from "../maps"
import { BOTS, DEFAULT_BOT } from "../bots"
import { ButiaSimStateMessage, ButiaSensorsMessage } from "../external/protocol"

type MessagePacket = { srcFrameIndex?: number; channel: string; data: ArrayBuffer }
type DebuggerMsg = { subtype: string }

let currRunId: string | undefined

function stopSim() {
    const sim = Simulation.instance
    sim.stop()
}

function restartSim() {
    const sim = Simulation.instance
    sim.stop()
    sim.clear()
    const map = MAPS["Test Map"]?.()
    if (map) {
        sim.loadMap(map)
    }
    sim.start()
}

function postMessagePacket(msg: unknown) {
    const payload = new TextEncoder().encode(JSON.stringify(msg))
    window.parent.postMessage(
        {
            type: "messagepacket",
            channel: "butia",
            data: payload,
        },
        "*"
    )
}

function handleButiaMessage(buf: ArrayBuffer, srcFrameIndex: number) {
    const data = new TextDecoder().decode(new Uint8Array(buf))
    const msg = JSON.parse(data) as ButiaSimStateMessage
    if (msg?.type !== "state") return

    const { deviceId, motorLeft, motorRight, id: runId } = msg

    // Restart simulation when the program restarts (new runId from primary frame)
    const isPrimarySim = srcFrameIndex <= 0
    if (isPrimarySim && currRunId !== runId) {
        currRunId = runId
        restartSim()
    }

    const sim = Simulation.instance
    const bot = sim.bot(deviceId) ?? sim.spawnBot(deviceId, BOTS[DEFAULT_BOT])
    if (!bot) return

    bot.setMotors(motorLeft, motorRight)
    bot.setLineSensorUsed(msg.lineUsed)
    bot.setRangeSensorUsed(msg.sonarUsed)

    const lineSensors = bot.readLineSensors()
    const distance = bot.readRangeSensor()

    const sensorMessage: ButiaSensorsMessage = {
        type: "sensors",
        id: runId,
        deviceId,
        lineLeft: lineSensors["left"] ?? 0,
        lineRight: lineSensors["right"] ?? 0,
        distance,
    }
    postMessagePacket(sensorMessage)
}

function handleMessagePacket(msg: MessagePacket) {
    const srcFrameIndex = msg.srcFrameIndex ?? -1
    switch (msg.channel) {
        case "butia":
            return handleButiaMessage(msg.data, srcFrameIndex)
        default:
            break
    }
}

function handleDebuggerMessage(msg: DebuggerMsg) {
    switch (msg.subtype) {
        case "traceConfig":
            restartSim()
            break
        case "stepinto":
            Simulation.instance.unpauseBots()
            break
        case "pause":
            Simulation.instance.pauseBots()
            break
        case "resume":
            Simulation.instance.unpauseBots()
            break
        default:
            break
    }
}

function handleStopMessage(_msg: unknown) {
    stopSim()
}

export function init() {
    window.addEventListener("message", (ev) => {
        if (ev.data?.source?.startsWith("react-devtools")) return
        if (ev.data?.type?.startsWith("webpack")) return
        if (ev.data?.startsWith?.("webpack")) return

        try {
            switch (ev.data?.type) {
                case "messagepacket":
                    return handleMessagePacket(ev.data as MessagePacket)
                case "stop":
                    return handleStopMessage(ev.data as unknown)
                case "run":
                    // Restart handled via new runId in state message
                    return
                case "debugger":
                    return handleDebuggerMessage(ev.data as DebuggerMsg)
                case "bulkserial":
                    return
                case "stopsound":
                    return
            }
        } catch (e) {
            console.error(e)
        }
    })
}
