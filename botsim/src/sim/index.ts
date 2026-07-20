import Physics from "./physics/physics"
import Renderer from "./rendering/renderer"
import { Entity } from "./entity"
import { EntitySpec, defaultStaticPhysics, defaultShapePhysics, defaultColorBrush } from "./entitySpec"
import { MapSpec } from "../maps/mapSpec"
import { BotSpec, ConnectorSlot, MountSide } from "../botSpecs/botSpec"
import { SensorSettings } from "../botSpecs/sensorSettings.model"
import { Bot, SpawnSpec } from "./bot"
import { InputController } from "./inputController"

export class Simulation {
    private running = false
    private paused = false
    private animframe = 0
    private _physics: Physics
    private _renderer: Renderer
    private _entities: Entity[] = []
    private _bot: Bot | null = null
    private _map: MapSpec | null = null
    // survives reset() with the same assignment it armed with; not re-negotiated mid-run
    private _lastPorts: Partial<Record<MountSide, ConnectorSlot>> | null = null
    private _lastSensorSettings: SensorSettings | null = null
    private lastTime = 0
    private lastPhysicsTime = 0
    private input: InputController

    public get physics() { return this._physics }
    public get renderer() { return this._renderer }
    public get bot(): Bot | null { return this._bot }
    // callers touching the renderer must await this (Pixi v8 async init)
    public readonly ready: Promise<void>

    private constructor() {
        this._physics = new Physics()
        this._renderer = new Renderer()
        this.input = new InputController(this._physics, this._renderer)
        this.ready = this._renderer.init()
    }

    private static _instance: Simulation
    public static get instance(): Simulation {
        if (!this._instance) this._instance = new Simulation()
        return this._instance
    }

    public createEntity(spec: EntitySpec): Entity {
        const physicsObj = this._physics.createObject(spec)
        const renderObj = this._renderer.createRenderObj(
            spec,
            () => physicsObj.pos,
            () => physicsObj.angle
        )
        const entity = new Entity()
        entity.init(renderObj, physicsObj)
        this._entities.push(entity)
        return entity
    }

    public loadMap(map: MapSpec): void {
        this._map = map
        this.buildWalls(map.width, map.width / map.aspectRatio)
        this._renderer.resize(map.width, map.width / map.aspectRatio)
        this._renderer.color(map.color)
        for (const entitySpec of map.entities) {
            this.createEntity(entitySpec)
        }
    }

    private buildWalls(widthCm: number, heightCm: number): void {
        const thickness = 1
        const walls = [
            { pos: { x: widthCm / 2, y: -thickness / 2 }, size: { x: widthCm + 4, y: thickness } }, // top
            { pos: { x: widthCm / 2, y: heightCm + thickness / 2 }, size: { x: widthCm + 4, y: thickness } }, // bottom
            { pos: { x: -thickness / 2, y: heightCm / 2 }, size: { x: thickness, y: heightCm + 4 } }, // left
            { pos: { x: widthCm + thickness / 2, y: heightCm / 2 }, size: { x: thickness, y: heightCm + 4 } }, // right
        ]
        for (const wall of walls) {
            this.createEntity({
                pos: wall.pos,
                angle: 0,
                physics: defaultStaticPhysics(),
                shapes: [{
                    type: "box",
                    roles: ["obstacle"],
                    size: wall.size,
                    halign: "center", valign: "center",
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    physics: { ...defaultShapePhysics(), density: 0 },
                    brush: { ...defaultColorBrush(), fillColor: "#333", borderColor: "#333", borderWidth: 0, visible: false },
                }],
            })
        }
    }

    public spawnBot(
        spec: BotSpec,
        spawn?: SpawnSpec,
        portAssignment?: Partial<Record<MountSide, ConnectorSlot>>,
        sensorSettings?: SensorSettings
    ): Bot {
        if (this._bot) {
            this._bot.destroy()
            this._bot = null
        }
        const spawnPt = spawn ?? (this._map?.spawns[0] ?? { pos: { x: 45, y: 45 }, angle: 0 })
        if (sensorSettings) {
            this._lastSensorSettings = sensorSettings
        }
        this._bot = new Bot(this, spawnPt, spec, this._lastSensorSettings ?? {})
        if (portAssignment) {
            this._lastPorts = portAssignment
        }
        if (this._lastPorts) {
            this._bot.setPortAssignment(this._lastPorts)
        }
        // zero-duration step: Planck only populates Fixture contacts after one
        // world.step(), else the first readSensors() right after spawn sees every
        // contact-based sensor as disconnected
        this._physics.update(0)
        return this._bot
    }

    public start(): void {
        if (this.running) return
        this.running = true
        this.lastTime = performance.now()
        this.lastPhysicsTime = this.lastTime
        this.loop(this.lastTime)
    }

    public stop(): void {
        if (!this.running) return
        this.running = false
        window.cancelAnimationFrame(this.animframe)
    }

    public pause(): void { this.paused = true; if (this._bot) this._bot.paused = true }
    public resume(): void { this.paused = false; if (this._bot) this._bot.paused = false }

    public clear(): void {
        this._entities.forEach(e => e.destroy())
        this._entities = []
        this._bot = null
        this._physics.reinit()
        this._renderer.reinit()
    }

    public reset(spec: BotSpec): void {
        this.stop()
        this.clear()
        if (this._map) this.loadMap(this._map)
        this.spawnBot(spec)
        this.start()
    }

    private loop = (now: number): void => {
        if (!this.running) return
        const dt = Math.min((now - this.lastTime) / 1000, 0.05)
        this.lastTime = now
        const dtMs = now - this.lastPhysicsTime
        if (!this.paused && dtMs >= 1000 / 60) {
            this.lastPhysicsTime = now
            this._physics.update(1 / 60)
            this._bot?.update(1 / 60)
            this._entities.forEach(e => e.renderObj.sync())
        }
        this._renderer.update(dt)
        this.updateCursor()
        this.animframe = window.requestAnimationFrame(this.loop)
    }

    public mountTo(container: HTMLElement): void {
        this._renderer.mountTo(container)
    }

    private get _lastMousePos(): { x: number; y: number } { return this.input.lastMousePos }
    private set _lastMousePos(pos: { x: number; y: number }) { this.input.lastMousePos = pos }

    public mouseDown(canvasPos: { x: number; y: number }): void {
        this.input.mouseDown(canvasPos)
    }

    public mouseMove(canvasPos: { x: number; y: number }): void {
        this.input.mouseMove(canvasPos)
    }

    public mouseUp(canvasPos: { x: number; y: number }): void {
        this.input.mouseUp(canvasPos)
    }

    private updateCursor(): void {
        void this._lastMousePos // keeps the forwarding accessor "read" for noUnusedLocals
        this.input.updateCursor()
    }
}
