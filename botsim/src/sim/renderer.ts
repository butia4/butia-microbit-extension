import * as Pixi from "pixi.js"
import { Vec2Like } from "../types/vec2"
import { MAP_ASPECT_RATIO } from "../constants"
import { EntitySpec, EntityShapeSpec, ColorBrushSpec, EntityPathShapeSpec } from "./entitySpec"
import { samplePath, toRenderScale, numberToRgb } from "./util"
import { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals, advanceShaderTime } from "./gl/shaderRegistry"
import { createGraphics } from "./gl/meshFactory"

// Re-exported so external callers (e.g. sonarVisuals.ts, which builds its own
// sonar wave/ping shaders and meshes) keep importing GL primitives from this
// module — renderer.ts stays the stable public surface for GL infra even
// though the implementation now lives in ./gl/shaderRegistry and
// ./gl/meshFactory.
export { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals, createGraphics }

// -------------------------------------------------------------------
// RenderObject — one Pixi container per entity
// -------------------------------------------------------------------
export class RenderObject {
    public container: Pixi.Container
    public shapes = new Map<string, Pixi.Container>()
    private physicsPos: () => Vec2Like
    private physicsAngle: () => number

    constructor(
        stage: Pixi.Container,
        spec: EntitySpec,
        physicsPos: () => Vec2Like,
        physicsAngle: () => number
    ) {
        this.physicsPos = physicsPos
        this.physicsAngle = physicsAngle
        this.container = new Pixi.Container()
        this.container.sortableChildren = true
        stage.addChild(this.container)
        this.buildShapes(spec.shapes)
    }

    private buildShapes(shapeSpecs: EntityShapeSpec[]): void {
        for (const s of shapeSpecs) {
            const gfx = this.drawShape(s)
            if (gfx) {
                gfx.visible = s.brush.visible
                this.container.addChild(gfx)
                if (s.label) this.shapes.set(s.label, gfx)
            }
        }
    }

    /**
     * Attaches an already-built display object to this entity's container,
     * after construction. Used by sensors (e.g. RangeSensor's sonar wave/ping
     * visuals) that are built lazily once the entity/body already exists.
     */
    public addShape(label: string, gfx: Pixi.Container): void {
        this.container.addChild(gfx)
        this.shapes.set(label, gfx)
    }

    private drawShape(s: EntityShapeSpec): Pixi.Container | null {
        if (s.brush.type === "texture" || s.brush.type === "shader") {
            if (s.type === "box") return createGraphics.box[s.brush.type](s, s.brush)
            if (s.type === "polygon" && s.verts.length >= 3) return createGraphics.polygon[s.brush.type](s, s.brush)
            return null
        }
        return this.drawColorShape(s)
    }

    private drawColorShape(s: EntityShapeSpec): Pixi.Graphics | null {
        const brush = s.brush as ColorBrushSpec
        const gfx = new Pixi.Graphics()
        const fill = parseInt(brush.fillColor.replace("#", "0x"), 16)
        const border = parseInt(brush.borderColor.replace("#", "0x"), 16)
        const borderW = toRenderScale(brush.borderWidth)
        const ox = toRenderScale(s.offset.x)
        const oy = toRenderScale(s.offset.y)
        const zIdx = brush.zIndex ?? 0

        switch (s.type) {
            case "box": {
                const hw = toRenderScale(s.size.x / 2)
                const hh = toRenderScale(s.size.y / 2)
                gfx.rect(ox - hw, oy - hh, hw * 2, hh * 2)
                    .fill(fill)
                    .stroke({ width: borderW, color: border })
                break
            }
            case "circle": {
                const r = toRenderScale(s.radius)
                if (brush.glow) {
                    const rgb = numberToRgb(fill)
                    const gradient = new Pixi.FillGradient({
                        type: "radial",
                        center: { x: 0.5, y: 0.5 }, innerRadius: 0,
                        outerCenter: { x: 0.5, y: 0.5 }, outerRadius: 0.5,
                        colorStops: [
                            { offset: 0, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0.95)` },
                            { offset: 0.55, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)` },
                            { offset: 1, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0)` },
                        ],
                        textureSpace: "local",
                    })
                    gfx.circle(ox, oy, r).fill(gradient)
                } else {
                    gfx.circle(ox, oy, r)
                        .fill(fill)
                        .stroke({ width: borderW, color: border })
                }
                break
            }
            case "polygon": {
                if (s.verts.length < 3) return null
                const pts = s.verts.flatMap(v => [ox + toRenderScale(v.x), oy + toRenderScale(v.y)])
                gfx.poly(pts)
                    .fill({ color: fill, alpha: 0.5 })
                    .stroke({ width: borderW, color: border })
                break
            }
            case "path": {
                const ps = s as EntityPathShapeSpec
                const sampled = samplePath(ps.verts, ps.closed, ps.stepSize)
                const hw = toRenderScale(ps.width / 2)
                if (sampled.length > 0) {
                    gfx.moveTo(ox + toRenderScale(sampled[0].x), oy + toRenderScale(sampled[0].y))
                    for (let i = 1; i < sampled.length; i++) {
                        gfx.lineTo(ox + toRenderScale(sampled[i].x), oy + toRenderScale(sampled[i].y))
                    }
                    if (ps.closed) {
                        gfx.lineTo(ox + toRenderScale(sampled[0].x), oy + toRenderScale(sampled[0].y))
                    }
                    gfx.stroke({ width: hw * 2, color: fill })
                }
                break
            }
            default:
                return null
        }
        gfx.zIndex = zIdx
        return gfx
    }

    public sync(): void {
        const pos = this.physicsPos()
        const angle = this.physicsAngle()
        this.container.position.set(toRenderScale(pos.x), toRenderScale(pos.y))
        this.container.rotation = angle
    }

    public update(_dtSecs: number): void {
        this.sync()
    }

    public destroy(): void {
        this.container.destroy({ children: true })
    }
}

// -------------------------------------------------------------------
// Renderer — Pixi app wrapper
// -------------------------------------------------------------------
export default class Renderer {
    // Populated by init() — Pixi v8 requires the Application to be
    // initialized asynchronously (await app.init(...)) before its stage,
    // renderer, and canvas exist. Callers must await init() before using any
    // other method on this class.
    private pixi!: Pixi.Application
    private pixiRenderer!: Pixi.Renderer
    private _size: Vec2Like = { x: 90 * MAP_ASPECT_RATIO, y: 90 }

    public get handle(): HTMLCanvasElement { return this.pixi.canvas as HTMLCanvasElement }
    public get logicalSize(): Vec2Like { return this._size }
    public get stage(): Pixi.Container { return this.pixi.stage }
    // Screen size of the canvas control (for mouse-coordinate conversion)
    public get canvasSize(): Vec2Like {
        const view = this.pixi.canvas as HTMLCanvasElement
        const rect = view.getBoundingClientRect?.()
        if (!rect || (rect.width === 0 && rect.height === 0)) return { x: view.width, y: view.height }
        return { x: rect.width, y: rect.height }
    }

    public setCanvasCursor(cursor: string): void {
        const view = this.pixi.canvas as HTMLCanvasElement
        if (view?.style) {
            view.style.cursor = cursor
        }
    }

    public async init(): Promise<void> {
        const w = toRenderScale(90 * MAP_ASPECT_RATIO)
        const h = toRenderScale(90)
        this._size = { x: 90 * MAP_ASPECT_RATIO, y: 90 }
        this.pixi = new Pixi.Application()
        await this.pixi.init({
            width: w, height: h,
            antialias: true,
            clearBeforeRender: true,
            backgroundAlpha: 1,
        })
        const view = this.pixi.canvas as HTMLCanvasElement
        if (view.style) {
            view.style.width = "100%"
            view.style.height = "100%"
        }
        this.pixi.stage.sortableChildren = true
        this.pixiRenderer = this.pixi.renderer as Pixi.Renderer
        this.color("#86BE27", 0.2)
        await Pixi.Assets.load("assets/logo.png")
    }

    public resize(widthCm: number, heightCm: number): void {
        this._size = { x: widthCm, y: heightCm }
        this.pixi.renderer.resize(toRenderScale(widthCm), toRenderScale(heightCm))
    }

    public color(hex: string, alpha: number = 1): void {
        this.pixiRenderer.background.color = parseInt(hex.replace("#", "0x"), 16)
        this.pixiRenderer.background.alpha = alpha
    }

    public reinit(): void {
        this.pixi.stage.removeChildren()
        this.pixi.stage.sortableChildren = true
    }

    public update(dtSecs: number): void {
        advanceShaderTime(dtSecs)
    }

    public createRenderObj(
        spec: EntitySpec,
        physicsPos: () => Vec2Like,
        physicsAngle: () => number
    ): RenderObject {
        return new RenderObject(this.pixi.stage, spec, physicsPos, physicsAngle)
    }

    public mountTo(container: HTMLElement): void {
        container.appendChild(this.pixi.canvas as HTMLCanvasElement)
    }
}
