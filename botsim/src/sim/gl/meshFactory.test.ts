import { describe, it, expect } from "vitest"
import * as Pixi from "pixi.js"
import { createGraphics } from "./meshFactory"
import {
    defaultShapePhysics,
    EntityBoxShapeSpec, EntityPolygonShapeSpec, TextureBrushSpec, ShaderBrushSpec,
} from "../entitySpec"
import { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals } from "./shaderRegistry"

function makeBoxShape(): EntityBoxShapeSpec {
    return {
        type: "box",
        size: { x: 10, y: 20 },
        halign: "center",
        valign: "center",
        roles: [],
        offset: { x: 0, y: 0 },
        angle: 0,
        physics: defaultShapePhysics(),
        brush: makeTextureBrush(),
    }
}

function makePolygonShape(): EntityPolygonShapeSpec {
    return {
        type: "polygon",
        verts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
        roles: [],
        offset: { x: 0, y: 0 },
        angle: 0,
        physics: defaultShapePhysics(),
        brush: makeTextureBrush(),
    }
}

function makeTextureBrush(): TextureBrushSpec {
    return { type: "texture", visible: true, zIndex: 0, texture: "placeholder.png", color: "#FFFFFF", alpha: 1 }
}

function makeShaderBrush(shader: string): ShaderBrushSpec {
    return { type: "shader", visible: true, zIndex: 0, shader, uniforms: {} }
}

addShaderProgram(
    "test_mesh_factory_shader",
    BasicVertexShader,
    CommonFragmentShaderGlobals + "void main() { gl_FragColor = vec4(1.0); }"
)

// Texture brushes reference "placeholder.png" by string id, resolved via
// Pixi's global Cache — under jsdom nothing preloads real image assets, so
// pre-seed the cache with a synthetic 1x1 texture to exercise the texture
// factories without needing real asset loading.
Pixi.Cache.set("placeholder.png", Pixi.Texture.WHITE)

describe("createGraphics.box.texture", () => {
    it("builds a textured box mesh positioned/rotated per the shape spec", () => {
        const shape = makeBoxShape()
        shape.offset = { x: 1, y: 2 }
        shape.angle = 45

        const gfx = createGraphics.box.texture(shape, shape.brush)

        expect(gfx).toBeInstanceOf(Pixi.Mesh)
        expect(gfx.angle).toBe(45)
        expect(gfx.visible).toBe(true)
    })
})

describe("createGraphics.box.shader", () => {
    it("builds a shaded box mesh and registers it for time-based uniform updates", () => {
        const shape = makeBoxShape()
        const brush = makeShaderBrush("test_mesh_factory_shader")

        const gfx = createGraphics.box.shader(shape, brush)

        expect(gfx).toBeInstanceOf(Pixi.Mesh)
        expect(gfx.visible).toBe(true)
    })
})

describe("createGraphics.polygon.texture", () => {
    it("builds a textured polygon mesh from the given vertices", () => {
        const shape = makePolygonShape()

        const gfx = createGraphics.polygon.texture(shape, shape.brush)

        expect(gfx).toBeInstanceOf(Pixi.Mesh)
        expect(gfx.visible).toBe(true)
    })
})

describe("createGraphics.polygon.shader", () => {
    it("builds a shaded polygon mesh from the given vertices", () => {
        const shape = makePolygonShape()
        const brush = makeShaderBrush("test_mesh_factory_shader")

        const gfx = createGraphics.polygon.shader(shape, brush)

        expect(gfx).toBeInstanceOf(Pixi.Mesh)
        expect(gfx.visible).toBe(true)
    })

    it("returns an empty container instead of a mesh when fewer than 3 vertices are given", () => {
        const shape = makePolygonShape()
        shape.verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }]
        const brush = makeShaderBrush("test_mesh_factory_shader")

        const gfx = createGraphics.polygon.shader(shape, brush)

        expect(gfx).toBeInstanceOf(Pixi.Container)
        expect(gfx).not.toBeInstanceOf(Pixi.Mesh)
    })
})
