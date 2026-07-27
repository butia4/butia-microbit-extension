import { Vec2Like } from "../shared/types/vec2"
import { MountSide } from "./mountSide"

export * from "./mountSide"
export * from "./connectorSlot"

export type MountSpec = {
    pos: Vec2Like       // offset from chassis center, cm
    facingDeg?: number  // heading offset from bot forward, degrees, clockwise-positive; default 0 (front)
}

export type MountSensorSpec = {
    name: MountSide
    pos: Vec2Like   // offset from chassis center, cm
    angle?: number      // beam/facing SPREAD width, degrees; undefined = sensor-type default, beam is ALWAYS rendered
    maxRange?: number   // visual beam length, cm; unused by gray/color/surface (they use a fixed constant)
    facingDeg?: number  // heading offset from bot forward, degrees, clockwise-positive; default 0 (front)
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

export type SquareChassisSpec = {
    shape: "square"
    side: number
    cornerRadius: number
    texture?: string
}

export type ChassisSpec = CircleChassisSpec | BoxChassisSpec | SquareChassisSpec

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
    sensorMounts: Record<MountSide, MountSpec>
}

export type RangeSensorSpec = MountSensorSpec & {
    angle: number
    maxRange: number
}

export function toWheels(spec: {
    separation: number
    diameter: number
    width: number
    y: number
    maxSpeed?: number
}): WheelSpec[] {
    const radius = spec.diameter / 2
    const maxSpeed = spec.maxSpeed ?? 100
    return [
        { name: "left",  maxSpeed, dashTime: 0.5, pos: { x: -(spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
        { name: "right", maxSpeed, dashTime: 0.5, pos: { x:  (spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
    ]
}
