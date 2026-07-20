import * as Planck from "planck"
import * as Pixi from "pixi.js"
import { ALL_MOUNT_SIDES, BotSpec, ConnectorSlot, MountSide } from "../../botSpecs/botSpec"
import { SensorType } from "../../simulatorBridge/protocol"
import { SensorSettings } from "../../botSpecs/sensorSettings.model"
import { Entity } from "../entity"
import { EntitySpec, defaultDynamicPhysics, defaultEntity } from "../entitySpec"
import { Vec2Like } from "../../shared/types/vec2"
import { toRenderScale } from "../rendering/util"
import { Chassis } from "./chassis"
import { Wheel } from "./wheel"
import { GraySensor } from "./sensors/graySensor"
import { LightSensor, LIGHT_MAX_RANGE, DEFAULT_LIGHT_ANGLE } from "./sensors/lightSensor"
import { RangeSensor, MAX_RANGE, DEFAULT_RANGE_ANGLE, DistanceSensor } from "./sensors/rangeSensor"
import { SurfaceSensor } from "./sensors/surfaceSensor"
import { SpawnSpec } from "../../maps/mapSpec"

export type { SpawnSpec }

const MOUNT_SIDES: readonly MountSide[] = ALL_MOUNT_SIDES

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
    private lightSensors = new Map<MountSide, LightSensor>()
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
        sensorSettings: SensorSettings = {}
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

        const logoSprite = Pixi.Sprite.from("assets/logo.png")
        logoSprite.anchor.set(0.5)
        const targetWidthCm = Chassis.footprintWidth(spec) * 0.65
        const targetWidthPx = toRenderScale(targetWidthCm)
        const scale = targetWidthPx / logoSprite.texture.width
        logoSprite.scale.set(scale)
        logoSprite.zIndex = 3 // above chassis (zIndex 2), below sonar visuals (5-6)
        this.entity.renderObj.addShape("logo", logoSprite)

        this.chassis = new Chassis(this, spec.chassis)
        for (const ws of spec.wheels) {
            this.wheels.set(ws.name, new Wheel(this, ws))
        }

        // Pre-create sensors for each of the 6 physical mounts. Both cone
        // sensors (LightSensor/RangeSensor|SurfaceSensor) are pre-built
        // regardless of runtime SensorType — the student's block code
        // decides at runtime which one it actually reads (see readSensors).
        for (const side of MOUNT_SIDES) {
            const mount = spec.sensorMounts[side]
            const cfg = sensorSettings[side]
            // Absent mount entry (or absent settings entirely) defaults to
            // "surface" — a deliberate breaking flip from the old
            // map-driven "forward" default (see spec's "Default mode for
            // unconfigured mounts").
            const mode = cfg?.mode ?? "surface"
            // `direction` only composes with the mount's fixed facingDeg
            // when mode==="forward" — GraySensor doesn't take a facingDeg
            // rotation at all (see below), so it's irrelevant there anyway.
            const effectiveFacingDeg = (mount.facingDeg ?? 0) + (mode === "forward" ? (cfg?.direction ?? 0) : 0)
            const lightAngle = cfg?.angle ?? DEFAULT_LIGHT_ANGLE
            const rangeAngle = cfg?.angle ?? DEFAULT_RANGE_ANGLE
            const lightMaxRange = cfg?.range ?? LIGHT_MAX_RANGE
            const rangeMaxRange = cfg?.range ?? MAX_RANGE
            const showCone = mode === "forward"

            // Line-following only makes sense for a mount physically facing
            // the floor ("surface" mode) — a mount configured "forward"
            // (angled out for distance/light sensing) has no business
            // reporting a line underneath it. Only wire up a GraySensor for
            // "surface" mounts; readSensors()'s `?? 0` default already
            // reports "no line" for any mount left unset here.
            if (mode === "surface") {
                this.graySensors.set(side, new GraySensor(
                    this,
                    { pos: mount.pos, name: side, facingDeg: mount.facingDeg }
                ))
            }
            this.lightSensors.set(side, new LightSensor(
                this,
                { pos: mount.pos, name: side, angle: lightAngle, maxRange: lightMaxRange, facingDeg: effectiveFacingDeg },
                showCone
            ))
            this.rangeSensors.set(side, mode === "surface"
                ? new SurfaceSensor(
                    this,
                    { pos: mount.pos, name: side, facingDeg: mount.facingDeg }
                )
                : new RangeSensor(
                    this,
                    { pos: mount.pos, name: side, angle: rangeAngle, maxRange: rangeMaxRange, facingDeg: effectiveFacingDeg }
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

    // Resolves which J-port is wired to which physical mount for the run.
    // MUST be called exactly once (at arm time, from the run's single
    // `Butia.setMap()` call) — no live/mid-run reassignment. Inverts the
    // mount->connector wiring map into the connector->mount lookup direction
    // `readSensors()` needs at runtime.
    public setPortAssignment(assignment: Partial<Record<MountSide, ConnectorSlot>>): void {
        const inverted: Partial<Record<ConnectorSlot, MountSide>> = {}
        for (const side of Object.keys(assignment) as MountSide[]) {
            const slot = assignment[side]
            if (slot) inverted[slot] = side
        }
        this.portAssignment = inverted
    }

    public readSensors(): Record<string, number> {
        const result: Record<string, number> = {}
        for (const [connName, sensorType] of Object.entries(this.activeSensorMap)) {
            const side = this.portAssignment[connName as ConnectorSlot]
            if (sensorType === "distance") {
                result[connName] = this.rangeSensors.get(side as MountSide)?.read() ?? MAX_RANGE
            } else if (sensorType === "light") {
                result[connName] = this.lightSensors.get(side as MountSide)?.read() ?? 0
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
