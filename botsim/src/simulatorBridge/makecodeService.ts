import { ButiaSensorsMsg, decodePacket, encodePacket, ButiaStateMsg, ButiaMapSelectMsg } from "./protocol"

type ServiceOptions = {
    onState: (msg: ButiaStateMsg) => void
    onMapSelect?: (msg: ButiaMapSelectMsg) => void
    onStop?: () => void
    onResume?: () => void
    onPause?: () => void
}

export function init(opts: ServiceOptions): () => void {
    const listener = (ev: MessageEvent): void => {
        // Filter out dev-tool noise
        if (typeof ev.data === "string") return
        if (ev.data?.source?.startsWith?.("react-devtools")) return

        try {
            switch (ev.data?.type) {
                case "messagepacket":
                    if (ev.data.channel !== "butia4/butia-microbit-extension") return
                    handlePacket(ev.data.data, opts)
                    break
                case "stop":
                    opts.onStop?.()
                    break
                case "debugger":
                    handleDebugger(ev.data, opts)
                    break
            }
        } catch (e) {
            console.error("[makecodeService]", e)
        }
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
}

function handlePacket(data: unknown, opts: ServiceOptions): void {
    const msg = decodePacket(data)
    if (!msg) return
    switch (msg.type) {
        case "state":
            opts.onState(msg)
            break
        case "mapselect":
            opts.onMapSelect?.(msg)
            break
    }
}

function handleDebugger(msg: { subtype?: string }, opts: ServiceOptions): void {
    switch (msg.subtype) {
        case "pause":
            opts.onPause?.()
            break
        case "resume":
        case "stepinto":
            opts.onResume?.()
            break
    }
}

export function sendSensors(id: string, values: Record<string, number>): void {
    const msg: ButiaSensorsMsg = { type: "sensors", id, values }
    const payload = encodePacket(msg)
    window.parent.postMessage({ type: "messagepacket", channel: "butia4/butia-microbit-extension", data: payload }, "*")
}
