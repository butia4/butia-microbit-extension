import * as Pixi from "pixi.js"
import earcut from "earcut"
import { Vec2 } from "../../shared/types/vec2"
import { AABB } from "../../shared/types/aabb"
import { RENDER_SCALE } from "../../shared/constants"
import {
    EntityShapeSpec, TextureBrushSpec, ShaderBrushSpec, BrushSpec,
    EntityBoxShapeSpec, EntityPolygonShapeSpec,
} from "../entitySpec"
import { toRenderScale, boxToVertices, calcUvs, flattenVerts, expandMesh, numberToRgb, rgbToFloatArray } from "./util"
import { getShaderProgram, buildUniformGroup, registerTimedShader } from "./shaderRegistry"

/*********************************************************************
 * TEXTURE / SHADER MESH FACTORIES (box + polygon only)
 ********************************************************************/

function hexToRgbFloats(hex: string): number[] {
    const n = parseInt(hex.replace("#", ""), 16)
    return rgbToFloatArray(numberToRgb(n))
}

function createTexturedBoxGraphics(shape: EntityBoxShapeSpec, brush: TextureBrushSpec): Pixi.Container {
    const verts = boxToVertices(shape).map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", { buffer: flattenVerts(mesh), size: 2 })
    geom.addAttribute("aUvs", { buffer: flattenVerts(uvs), size: 2 })

    const glProgram = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader({
        glProgram,
        resources: {
            uSampler2: Pixi.Texture.from(brush.texture).source,
            uniforms: buildUniformGroup({
                uBrushColor: hexToRgbFloats(brush.color),
                uAlpha: brush.alpha,
                uAspectRatio,
            }),
        },
    })
    const g = new Pixi.Mesh({ geometry: geom, shader })
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g
}

function createShadedBoxGraphics(shape: EntityBoxShapeSpec, brush: ShaderBrushSpec): Pixi.Container {
    const verts = boxToVertices(shape).map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", { buffer: flattenVerts(mesh), size: 2 })
    geom.addAttribute("aUvs", { buffer: flattenVerts(uvs), size: 2 })

    const glProgram = getShaderProgram(brush.shader)
    const uniforms = buildUniformGroup({ ...brush.uniforms, uAspectRatio, uTime: 0 })
    const shader = new Pixi.Shader({ glProgram, resources: { uniforms } })
    const g = new Pixi.Mesh({ geometry: geom, shader })
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    registerTimedShader(g, uniforms)
    return g
}

function createTexturedPolygonGraphics(shape: EntityPolygonShapeSpec, brush: TextureBrushSpec): Pixi.Container {
    const verts = shape.verts.map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", { buffer: flattenVerts(mesh), size: 2 })
    geom.addAttribute("aUvs", { buffer: flattenVerts(uvs), size: 2 })

    const glProgram = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader({
        glProgram,
        resources: {
            uSampler2: Pixi.Texture.from(brush.texture).source,
            uniforms: buildUniformGroup({
                uBrushColor: hexToRgbFloats(brush.color),
                uAlpha: brush.alpha,
                uAspectRatio,
            }),
        },
    })
    const g = new Pixi.Mesh({ geometry: geom, shader })
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g
}

function createShadedPolygonGraphics(shape: EntityPolygonShapeSpec, brush: ShaderBrushSpec): Pixi.Container {
    if (shape.verts.length < 3) return new Pixi.Container()
    const verts = shape.verts.map(v => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)

    const geom = new Pixi.Geometry()
    geom.addAttribute("aVerts", { buffer: flattenVerts(mesh), size: 2 })
    geom.addAttribute("aUvs", { buffer: flattenVerts(uvs), size: 2 })

    const glProgram = getShaderProgram(brush.shader)
    const uniforms = buildUniformGroup({ ...brush.uniforms, uAspectRatio, uTime: 0 })
    const shader = new Pixi.Shader({ glProgram, resources: { uniforms } })
    const g = new Pixi.Mesh({ geometry: geom, shader })
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    registerTimedShader(g, uniforms)
    return g
}

type ShapeBrushFactory = (shape: EntityShapeSpec, brush: BrushSpec) => Pixi.Container

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
