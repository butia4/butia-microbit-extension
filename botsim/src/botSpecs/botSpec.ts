import { Vec2Like } from "../types/vec2"

// Wire-level slot naming (J1-J5) — what a student's `Butia.setMap()` call
// wires up. Fully decoupled from the physical mount naming below (MountSide):
// a run maps up to 5 of these J-ports onto the bot's 6 mounts (at least one
// mount is always unconfigured — 6 mounts, 5 connectors, by design).
export type ConnectorSlot = "J1" | "J2" | "J3" | "J4" | "J5"

// Physical sensor mount naming — the bot has exactly 6 fixed physical mount
// positions: 2 frontal, 2 lateral, 2 rear. Fully decoupled from the wire/
// protocol-level J-port naming (see ConnectorSlot), which is resolved to a
// MountSide via Bot.portAssignment. All 6 mounts always physically exist on
// the bot spec, regardless of which (if any) are wired to a connector.
export type MountSide = "frontLeft" | "frontRight" | "sideLeft" | "sideRight" | "rearLeft" | "rearRight"

// Single source of truth for "all 6 mounts, in a stable order" — every
// consumer that needs to iterate/validate the full mount set (sensor
// construction, pin-assignment shape validation, the settings-screen row
// list) imports this instead of hand-typing its own copy of the 6 literals,
// so adding/renaming a mount can't silently drift out of sync in one spot.
export const ALL_MOUNT_SIDES: readonly MountSide[] = ["frontLeft", "frontRight", "sideLeft", "sideRight", "rearLeft", "rearRight"]

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
