import * as Pixi from "pixi.js"
import earcut from "earcut"
import { Vec2, Vec2Like } from "../types/vec2"
import { AABB } from "../types/aabb"
import { MAP_ASPECT_RATIO, RENDER_SCALE } from "../constants"
import {
    EntitySpec, EntityShapeSpec, ColorBrushSpec, EntityPathShapeSpec,
    TextureBrushSpec, ShaderBrushSpec, BrushSpec,
    EntityBoxShapeSpec, EntityPolygonShapeSpec,
} from "./specs"
import { samplePath, toRenderScale, boxToVertices, calcUvs, flattenVerts, expandMesh, numberToRgb, rgbToFloatArray } from "./util"

/*********************************************************************
 * SHADERS
 ********************************************************************/

// Shader programs are built lazily (on first actual use, via
// getShaderProgram), not at registration time. Pixi.Program.from() probes the
// browser's WebGL context (max fragment precision), which doesn't exist under
// jsdom/vitest — building eagerly at module-import time would break any test
// that merely imports this module (e.g. RangeSensor, which registers the
// sonar shaders) even if it never actually renders anything.
type ShaderSource = { vert: string; frag: string }
const shaderSources = new Map<string, ShaderSource>()
const shaderPrograms = new Map<string, Pixi.Program>()

export function addShaderProgram(name: string, vert: string, frag: string): void {
    shaderSources.set(name, { vert, frag })
}

export function getShaderProgram(name: string): Pixi.Program {
    const cached = shaderPrograms.get(name)
    if (cached) return cached
    const src = shaderSources.get(name)
    if (!src) {
        console.error(`shader program not found: "${name}"`)
        return getShaderProgram("$$missing_shader$$")
    }
    const pgm = Pixi.Program.from(src.vert, src.frag)
    shaderPrograms.set(name, pgm)
    return pgm
}

export const CommonVertexShaderGlobals = `
    precision mediump float;
    attribute vec2 aVerts;
    attribute vec2 aUvs;
    uniform float uAspectRatio;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    uniform float uTime;
    varying vec2 vUvs;
`
export const BasicVertexShader =
    CommonVertexShaderGlobals +
    `
    void main() {
        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVerts, 1.0)).xy, 0.0, 1.0);
    }`

export const CommonFragmentShaderGlobals = `
        precision mediump float;
        uniform float uTime;
        uniform float uAspectRatio;
        varying vec2 vUvs;
    `

addShaderProgram(
    "$$missing_shader$$",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
        void main() {
            vec2 uv = vUvs;
            uv = vec2(uv.x * uAspectRatio, uv.y);
            uv = floor(uv * 10.);
            vec3 color1 = vec3(0.4, 0.0, 0.0);
            vec3 color2 = vec3(0.0, 0.4, 0.4);
            vec3 outColor = mod(uv.x + uv.y, 2.) < 0.5 ? color1 : color2;
            gl_FragColor = vec4(outColor.rgb, 0.5);
        }`
)

addShaderProgram(
    "textured_colored",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
        uniform sampler2D uSampler2;
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() {
            vec2 uv = vUvs;
            uv = vec2(uv.x * uAspectRatio, uv.y);
            gl_FragColor = texture2D(uSampler2, uv) * vec4(uColor.rgb, uAlpha);
        }`
)

/*********************************************************************
 * TEXTURE / SHADER MESH FACTORIES (box + polygon only)
 ********************************************************************/

function hexToRgbFloats(hex: string): number[] {
    const n = parseInt(hex.replace("#", ""), 16)
    return rgbToFloatArray(numberToRgb(n))
}

function createTexturedBoxGraphics(shape: EntityBoxShapeSpec, brush: TextureBrushSpec): Pixi.DisplayObject {
    const verts = boxToVertices(shape).map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", flattenVerts(mesh), 2)
    geom.addAttribute("aUvs", flattenVerts(uvs), 2)

    const pgm = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader(pgm, {
        uSampler2: Pixi.Texture.from(brush.texture),
        uColor: hexToRgbFloats(brush.color),
        uAlpha: brush.alpha,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as unknown as Pixi.DisplayObject
}

function createShadedBoxGraphics(shape: EntityBoxShapeSpec, brush: ShaderBrushSpec): Pixi.DisplayObject {
    const verts = boxToVertices(shape).map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", flattenVerts(mesh), 2)
    geom.addAttribute("aUvs", flattenVerts(uvs), 2)

    const pgm = getShaderProgram(brush.shader)
    const shader = new Pixi.Shader(pgm, { ...brush.uniforms, uAspectRatio })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as unknown as Pixi.DisplayObject
}

function createTexturedPolygonGraphics(shape: EntityPolygonShapeSpec, brush: TextureBrushSpec): Pixi.DisplayObject {
    const verts = shape.verts.map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", flattenVerts(mesh), 2)
    geom.addAttribute("aUvs", flattenVerts(uvs), 2)

    const pgm = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader(pgm, {
        uSampler2: Pixi.Texture.from(brush.texture),
        uColor: hexToRgbFloats(brush.color),
        uAlpha: brush.alpha,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as unknown as Pixi.DisplayObject
}

function createShadedPolygonGraphics(shape: EntityPolygonShapeSpec, brush: ShaderBrushSpec): Pixi.DisplayObject {
    if (shape.verts.length < 3) return new Pixi.Container()
    const verts = shape.verts.map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", flattenVerts(mesh), 2)
    geom.addAttribute("aUvs", flattenVerts(uvs), 2)

    const pgm = getShaderProgram(brush.shader)
    const shader = new Pixi.Shader(pgm, { ...brush.uniforms, uAspectRatio })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as unknown as Pixi.DisplayObject
}

type ShapeBrushFactory = (shape: EntityShapeSpec, brush: BrushSpec) => Pixi.DisplayObject

/**
 * Factory matrix for non-color brushes. Only box/polygon shapes support
 * texture/shader brushes today (chassis texture + sonar wave/ping visuals) —
 * see design decision #5.
 */
export const createGraphics: {
    box: { texture: ShapeBrushFactory; shader: ShapeBrushFactory }
    polygon: { texture: ShapeBrushFactory; shader: ShapeBrushFactory }
} = {
    box: {
        texture: (s, b) => createTexturedBoxGraphics(s as EntityBoxShapeSpec, b as TextureBrushSpec),
        shader: (s, b) => createShadedBoxGraphics(s as EntityBoxShapeSpec, b as ShaderBrushSpec),
    },
    polygon: {
        texture: (s, b) => createTexturedPolygonGraphics(s as EntityPolygonShapeSpec, b as TextureBrushSpec),
        shader: (s, b) => createShadedPolygonGraphics(s as EntityPolygonShapeSpec, b as ShaderBrushSpec),
    },
}

// -------------------------------------------------------------------
// RenderObject — one Pixi container per entity
// -------------------------------------------------------------------
export class RenderObject {
    public container: Pixi.Container
    public shapes = new Map<string, Pixi.DisplayObject>()
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
    public addShape(label: string, gfx: Pixi.DisplayObject): void {
        this.container.addChild(gfx)
        this.shapes.set(label, gfx)
    }

    private drawShape(s: EntityShapeSpec): Pixi.DisplayObject | null {
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
                gfx.lineStyle(borderW, border)
                gfx.beginFill(fill)
                gfx.drawRect(ox - hw, oy - hh, hw * 2, hh * 2)
                gfx.endFill()
                break
            }
            case "circle": {
                gfx.lineStyle(borderW, border)
                gfx.beginFill(fill)
                gfx.drawCircle(ox, oy, toRenderScale(s.radius))
                gfx.endFill()
                break
            }
            case "polygon": {
                if (s.verts.length < 3) return null
                const pts = s.verts.flatMap(v => [ox + toRenderScale(v.x), oy + toRenderScale(v.y)])
                gfx.lineStyle(borderW, border)
                gfx.beginFill(fill, 0.5)
                gfx.drawPolygon(pts)
                gfx.endFill()
                break
            }
            case "path": {
                const ps = s as EntityPathShapeSpec
                const sampled = samplePath(ps.verts, ps.closed, ps.stepSize)
                const hw = toRenderScale(ps.width / 2)
                gfx.lineStyle(hw * 2, fill)
                if (sampled.length > 0) {
                    gfx.moveTo(ox + toRenderScale(sampled[0].x), oy + toRenderScale(sampled[0].y))
                    for (let i = 1; i < sampled.length; i++) {
                        gfx.lineTo(ox + toRenderScale(sampled[i].x), oy + toRenderScale(sampled[i].y))
                    }
                    if (ps.closed) {
                        gfx.lineTo(ox + toRenderScale(sampled[0].x), oy + toRenderScale(sampled[0].y))
                    }
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
    private pixi: Pixi.Application
    private pixiRenderer: Pixi.Renderer
    private _size: Vec2Like

    public get handle(): Pixi.ICanvas { return this.pixi.view as Pixi.ICanvas }
    public get logicalSize(): Vec2Like { return this._size }
    public get stage(): Pixi.Container { return this.pixi.stage }
    // Screen size of the canvas control (for mouse-coordinate conversion)
    public get canvasSize(): Vec2Like {
        const view = this.pixi.view as HTMLCanvasElement
        const rect = view.getBoundingClientRect?.()
        if (!rect || (rect.width === 0 && rect.height === 0)) return { x: view.width, y: view.height }
        return { x: rect.width, y: rect.height }
    }

    constructor() {
        const w = toRenderScale(90 * MAP_ASPECT_RATIO)
        const h = toRenderScale(90)
        this._size = { x: 90 * MAP_ASPECT_RATIO, y: 90 }
        this.pixi = new Pixi.Application({
            width: w, height: h,
            antialias: true,
            clearBeforeRender: true,
        })
        const view = this.pixi.view as HTMLCanvasElement
        if (view.style) {
            view.style.width = "100%"
            view.style.height = "100%"
        }
        this.pixi.stage.sortableChildren = true
        this.pixiRenderer = this.pixi.renderer as Pixi.Renderer
        // Global uniforms must be created before the first render — drives
        // time-based shader animation (e.g. the sonar wave/ping effect).
        this.pixiRenderer.globalUniforms.uniforms.uTime = 0
    }

    public resize(widthCm: number, heightCm: number): void {
        this._size = { x: widthCm, y: heightCm }
        this.pixi.renderer.resize(toRenderScale(widthCm), toRenderScale(heightCm))
    }

    public color(hex: string): void {
        this.pixiRenderer.background.color = parseInt(hex.replace("#", "0x"), 16)
    }

    public reinit(): void {
        this.pixi.stage.removeChildren()
        this.pixi.stage.sortableChildren = true
    }

    public update(dtSecs: number): void {
        this.pixiRenderer.globalUniforms.uniforms.uTime += dtSecs
    }

    public createRenderObj(
        spec: EntitySpec,
        physicsPos: () => Vec2Like,
        physicsAngle: () => number
    ): RenderObject {
        return new RenderObject(this.pixi.stage, spec, physicsPos, physicsAngle)
    }

    public mountTo(container: HTMLElement): void {
        container.appendChild(this.pixi.view as HTMLCanvasElement)
    }
}
