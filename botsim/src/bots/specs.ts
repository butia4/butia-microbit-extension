import { Vec2Like } from "../types/vec2"

// Wire-level slot naming (J1-J5) — what a student's `Butia.setMap()` call
// wires up. Fully decoupled from the physical mount naming below (MountSide):
// a run maps exactly 2 of these J-ports onto the bot's `left`/`right` mounts.
export type ConnectorSlot = "J1" | "J2" | "J3" | "J4" | "J5"

// Physical sensor mount naming — the bot has exactly 2 fixed physical mount
// positions, both on the chassis front face. Replaces the old 5-connector
// (J1-J5) physical model; J-port naming now lives purely at the wire/protocol
// level (see ConnectorSlot) and is resolved to a MountSide via
// Bot.portAssignment.
export type MountSide = "left" | "right"

export type MountSpec = {
    pos: Vec2Like   // offset from chassis center, cm
}

export type MountSensorSpec = {
    name: MountSide
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
    sensorMounts: { left: MountSpec; right: MountSpec }
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
}): WheelSpec[] {
    const radius = spec.diameter / 2
    return [
        { name: "left",  maxSpeed: 100, dashTime: 0.5, pos: { x: -(spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
        { name: "right", maxSpeed: 100, dashTime: 0.5, pos: { x:  (spec.separation + spec.width) / 2, y: spec.y }, width: spec.width, radius },
    ]
}
