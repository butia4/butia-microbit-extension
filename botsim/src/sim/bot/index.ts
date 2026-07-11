import Planck from "planck-js"
import { BotSpec, ConnectorSlot } from "../../bots/specs"
import { SensorType } from "../../protocol"
import { Entity } from "../entity"
import { EntitySpec, defaultDynamicPhysics, defaultEntity } from "../specs"
import { Vec2Like } from "../../types/vec2"
import { Chassis } from "./chassis"
import { Wheel } from "./wheel"
import { GraySensor } from "./graySensor"
import { RangeSensor, MAX_RANGE } from "./rangeSensor"

export type SpawnSpec = { pos: Vec2Like; angle: number }

export class Bot {
    public entity: Entity
    public paused = false

    // Derived, not stored: true whenever the active mouse-drag joint is
    // grabbing this bot's body. Avoids a stale flag that never gets reset.
    public get held(): boolean {
        const heldBody = this.sim.physics.mouseJoint?.getBodyB()
        return heldBody === this.entity.physicsObj.body
    }

    private chassis: Chassis
    private wheels = new Map<"left" | "right", Wheel>()
    private graySensors = new Map<ConnectorSlot, GraySensor>()
    private rangeSensors = new Map<ConnectorSlot, RangeSensor>()
    private activeSensorMap: Record<string, SensorType> = {}

    public get pos(): Vec2Like { return this.entity.physicsObj.pos }
    public get angle(): number { return this.entity.physicsObj.angle }
    public get forward(): Vec2Like { return this.entity.physicsObj.forward }

    constructor(
        public sim: {
            createEntity: (spec: EntitySpec) => Entity
            physics: { mouseJoint: { getBodyB(): Planck.Body | undefined } | undefined }
        },
        spawn: SpawnSpec,
        public spec: BotSpec
    ) {
        const chassisShape = Chassis.makeShapeSpec(spec)
        const wheelShapes = spec.wheels.map(ws => Wheel.makeShapeSpec(spec, ws))

        const entitySpec: EntitySpec = {
            ...defaultEntity(),
            pos: { ...spawn.pos },
            angle: spawn.angle,
            physics: { ...defaultDynamicPhysics(), linearDamping: 10, angularDamping: 10 },
            shapes: [chassisShape, ...wheelShapes],
        }
        this.entity = sim.createEntity(entitySpec)

        this.chassis = new Chassis(this, spec.chassis)
        for (const ws of spec.wheels) {
            this.wheels.set(ws.name, new Wheel(this as unknown as any, ws))
        }

        // Pre-create sensors for each connector
        for (const conn of spec.connectors) {
            this.graySensors.set(conn.name, new GraySensor(
                this as unknown as any,
                { pos: conn.pos, name: conn.name }
            ))
            this.rangeSensors.set(conn.name, new RangeSensor(
                this as unknown as any,
                { pos: conn.pos, beamAngle: 30, maxRange: MAX_RANGE }
            ))
        }
    }

    public setMotors(left: number, right: number): void {
        this.wheels.get("left")?.setSpeed(left)
        this.wheels.get("right")?.setSpeed(right)
    }

    public setSensorMap(map: Record<string, SensorType>): void {
        this.activeSensorMap = { ...map }
    }

    public readSensors(): Record<string, number> {
        const result: Record<string, number> = {}
        for (const [connName, sensorType] of Object.entries(this.activeSensorMap)) {
            const slot = connName as ConnectorSlot
            if (sensorType === "distance") {
                result[connName] = this.rangeSensors.get(slot)?.read() ?? MAX_RANGE
            } else {
                // gray or light — treat identically
                result[connName] = this.graySensors.get(slot)?.read() ?? 0
            }
        }
        return result
    }

    public update(dtSecs: number): void {
        this.chassis.update(dtSecs)
        this.wheels.forEach(w => w.update(dtSecs))
    }

    public destroy(): void {
        this.chassis.destroy()
        this.wheels.forEach(w => w.destroy())
        this.entity.destroy()
    }
}
