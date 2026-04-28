export interface ButiaSimStateMessage {
    type: "state"
    id: string
    deviceId: number
    motorLeft: number
    motorRight: number
    lineUsed: boolean
    sonarUsed: boolean
}

export interface ButiaSensorsMessage {
    type: "sensors"
    id: string
    deviceId: number
    lineLeft: number
    lineRight: number
    distance: number
}
