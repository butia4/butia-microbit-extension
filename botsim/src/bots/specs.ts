import { Vec2Like } from "../types/vec2"

export type ConnectorSlot = "J1" | "J2" | "J3" | "J4" | "J5"

export type ConnectorSensorSpec = {
    name: ConnectorSlot
    pos: Vec2Like   // offset from chassis center, cm
    angle?: number      // beam/facing orientation, degrees; undefined = sensor-type default, beam is ALWAYS rendered
    maxRange?: number   // visual beam length, cm; unused by gray/color/surface (they use a fixed constant)
}

export type CircleChassisSpec = {
    shape: "circle"
    radius: number
    texture?: string
}

export type BoxChassisSpec = {
    shape: "box"
    size: Vec2Like
    texture?: string
}

export type ChassisSpec = CircleChassisSpec | BoxChassisSpec

export type WheelSpec = {
    name: "left" | "right"
    maxSpeed: number
    dashTime: number
    pos: Vec2Like
    width: number
    radius: number
    visible?: boolean
}

export type BotSpec = {
    name: string
    mass: number
    chassis: ChassisSpec
    wheels: WheelSpec[]
    connectors: ConnectorSensorSpec[]
}

export type RangeSensorSpec = ConnectorSensorSpec & {
    angle: number
    maxRange: number
}

export function toWheels(spec: {
    separation: number
    diameter: number
    width: number
    y: number
}): WheelSpec[] {
    const radius = spec.diameter / 2
    return [
        { name: "left",  maxSpeed: 100, dashTime: 0.5, pos: { x: -(spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
        { name: "right", maxSpeed: 100, dashTime: 0.5, pos: { x:  (spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
    ]
}
