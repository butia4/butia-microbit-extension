import Planck from "planck-js"
import { BotSpec, ConnectorSlot, MountSide } from "../../bots/specs"
import { SensorType } from "../../protocol"
import { Entity } from "../entity"
import { EntitySpec, defaultDynamicPhysics, defaultEntity } from "../specs"
import { Vec2Like } from "../../types/vec2"
import { Chassis } from "./chassis"
import { Wheel } from "./wheel"
import { GraySensor } from "./graySensor"
import { ColorSensor } from "./colorSensor"
import { RangeSensor, MAX_RANGE, DEFAULT_RANGE_ANGLE, DistanceSensor } from "./rangeSensor"
import { SurfaceSensor } from "./surfaceSensor"

export type SpawnSpec = { pos: Vec2Like; angle: number }

const MOUNT_SIDES: MountSide[] = ["left", "right"]

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
    private graySensors = new Map<MountSide, GraySensor>()
    private colorSensors = new Map<MountSide, ColorSensor>()
    private rangeSensors = new Map<MountSide, DistanceSensor>()
    private activeSensorMap: Record<string, SensorType> = {}

    // Wire-level J-port -> physical-mount resolution. Set exactly once via
    // setPortAssignment() (from the run's single `Butia.setMap()` call) — no
    // code path re-invokes or mutates this after arm time (see spec's
    // "Port assignment set once, at arm time" requirement).
    private portAssignment: Partial<Record<ConnectorSlot, MountSide>> = {}

    public get pos(): Vec2Like { return this.entity.physicsObj.pos }
    public get angle(): number { return this.entity.physicsObj.angle }
    public get forward(): Vec2Like { return this.entity.physicsObj.forward }

    constructor(
        public sim: {
            createEntity: (spec: EntitySpec) => Entity
            physics: { mouseJoint: { getBodyB(): Planck.Body | undefined } | undefined }
        },
        spawn: SpawnSpec,
        public spec: BotSpec,
        sensorModes: Partial<Record<MountSide, "forward" | "surface">> = {}
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

        // Pre-create sensors for each physical mount (left, right) — exactly
        // 2 sets, replacing the old 5-connector loop.
        for (const side of MOUNT_SIDES) {
            const mount = spec.sensorMounts[side]
            this.graySensors.set(side, new GraySensor(
                this as unknown as any,
                { pos: mount.pos, name: side }
            ))
            this.colorSensors.set(side, new ColorSensor(
                this as unknown as any,
                { pos: mount.pos, name: side }
            ))
            const mode = sensorModes[side] ?? "forward"
            this.rangeSensors.set(side, mode === "surface"
                ? new SurfaceSensor(
                    this as unknown as any,
                    { pos: mount.pos, name: side }
                )
                : new RangeSensor(
                    this as unknown as any,
                    { pos: mount.pos, name: side, angle: DEFAULT_RANGE_ANGLE, maxRange: MAX_RANGE }
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

    // Resolves which J-port is wired to the `left`/`right` physical mount for
    // the run. MUST be called exactly once (at arm time, from the run's
    // single `Butia.setMap()` call) — no live/mid-run reassignment.
    public setPortAssignment(left: ConnectorSlot, right: ConnectorSlot): void {
        this.portAssignment = { [left]: "left", [right]: "right" }
    }

    public readSensors(): Record<string, number> {
        const result: Record<string, number> = {}
        for (const [connName, sensorType] of Object.entries(this.activeSensorMap)) {
            const side = this.portAssignment[connName as ConnectorSlot]
            if (sensorType === "distance") {
                result[connName] = this.rangeSensors.get(side as MountSide)?.read() ?? MAX_RANGE
            } else if (sensorType === "light") {
                result[connName] = this.colorSensors.get(side as MountSide)?.read() ?? 0
            } else {
                // gray (default)
                result[connName] = this.graySensors.get(side as MountSide)?.read() ?? 0
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
