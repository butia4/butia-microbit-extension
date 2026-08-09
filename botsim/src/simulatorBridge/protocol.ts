export type SensorType = "distance" | "gray" | "light"

export interface ButiaStateMsg {
    type: "state"
    id: string
    motorLeft: number   // -100..100
    motorRight: number  // -100..100
    sensors: Record<string, SensorType>
    // Active hardware model ("butiaV3"/"butiaV4"); absent/unknown defaults to v4.
    model?: string
}

export interface ButiaSensorsMsg {
    type: "sensors"
    id: string
    values: Record<string, number>
}

export interface ButiaMapSelectMsg {
    type: "mapselect"
    id: number
}

export interface ButiaErrorMsg {
    type: "error"
    code: string
}

export function decodePacket(data: unknown): ButiaStateMsg | ButiaMapSelectMsg | ButiaErrorMsg | null {
    try {
        const json = new TextDecoder().decode(new Uint8Array(data as ArrayBuffer))
        const msg = JSON.parse(json)
        if (msg?.type === "state") return msg as ButiaStateMsg
        if (msg?.type === "mapselect") return msg as ButiaMapSelectMsg
        if (msg?.type === "error") return msg as ButiaErrorMsg
        return null
    } catch {
        return null
    }
}

export function encodePacket(msg: ButiaSensorsMsg): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(msg))
}
