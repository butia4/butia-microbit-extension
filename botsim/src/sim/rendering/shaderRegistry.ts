import * as Pixi from "pixi.js"

/*********************************************************************
 * SHADERS
 ********************************************************************/

// Shader programs are built lazily (on first actual use, via
// getShaderProgram), not at registration time. Pixi.GlProgram.from() probes
// the browser's WebGL context (max fragment precision), which doesn't exist
// under jsdom/vitest — building eagerly at module-import time would break any
// test that merely imports this module (e.g. RangeSensor, which registers
// the sonar shaders) even if it never actually renders anything.
type ShaderSource = { vert: string; frag: string }
const shaderSources = new Map<string, ShaderSource>()
const shaderPrograms = new Map<string, Pixi.GlProgram>()

export function addShaderProgram(name: string, vert: string, frag: string): void {
    shaderSources.set(name, { vert, frag })
}

export function getShaderProgram(name: string): Pixi.GlProgram {
    const cached = shaderPrograms.get(name)
    if (cached) return cached
    const src = shaderSources.get(name)
    if (!src) {
        console.error(`shader program not found: "${name}"`)
        return getShaderProgram("$$missing_shader$$")
    }
    const pgm = Pixi.GlProgram.from({ vertex: src.vert, fragment: src.frag })
    shaderPrograms.set(name, pgm)
    return pgm
}

// Meshes built with a shader brush that animates via `uTime` (e.g. the sonar
// ping) — Pixi v8 removed the old renderer-wide globalUniforms.uniforms
// escape hatch, so each shaded mesh gets its own `uTime` uniform that this
// registry advances every frame (see Renderer.update below).
const timedUniformGroups = new Map<Pixi.Container, Pixi.UniformGroup>()

export function registerTimedShader(mesh: Pixi.Container, uniforms: Pixi.UniformGroup): void {
    timedUniformGroups.set(mesh, uniforms)
    mesh.once("destroyed", () => timedUniformGroups.delete(mesh))
}

export function advanceShaderTime(dtSecs: number): void {
    for (const uniforms of timedUniformGroups.values()) {
        (uniforms.uniforms as { uTime: number }).uTime += dtSecs
    }
}

// Per-frame redraw hook for plain (non-shader) animated Pixi.Graphics —
// e.g. the sonar wave/cone, drawn as vector arcs instead of a per-pixel
// shader (see sonarVisuals.ts). Mirrors registerTimedShader/
// advanceShaderTime's per-frame-tick pattern, minus the uTime uniform
// plumbing a plain Graphics object doesn't have.
const timedRedraws = new Map<Pixi.Container, (elapsedSecs: number) => void>()
let elapsedSecs = 0

export function registerTimedRedraw(container: Pixi.Container, redraw: (elapsedSecs: number) => void): void {
    timedRedraws.set(container, redraw)
    container.once("destroyed", () => timedRedraws.delete(container))
    redraw(elapsedSecs) // paint the first frame immediately, don't wait for the next tick
}

export function advanceGraphicsAnimations(dtSecs: number): void {
    elapsedSecs += dtSecs
    for (const redraw of timedRedraws.values()) redraw(elapsedSecs)
}

// Every uniform in a Shader's `resources` record gets independently wrapped
// in its own single-member UniformGroup by Pixi unless it's already one —
// so plain scalars/vectors must be combined into one explicit UniformGroup
// (with an inferred glsl type per value) rather than passed as bare values.
export type UniformValue = number | number[]

export function inferUniformType(value: UniformValue): Pixi.UNIFORM_TYPES {
    if (typeof value === "number") return "f32"
    switch (value.length) {
        case 2: return "vec2<f32>"
        case 3: return "vec3<f32>"
        case 4: return "vec4<f32>"
        default: throw new Error(`unsupported uniform vector length: ${value.length}`)
    }
}

export function buildUniformGroup(uniforms: Record<string, UniformValue>): Pixi.UniformGroup<Record<string, { value: UniformValue; type: Pixi.UNIFORM_TYPES }>> {
    const structures: Record<string, { value: UniformValue; type: Pixi.UNIFORM_TYPES }> = {}
    for (const [name, value] of Object.entries(uniforms)) {
        structures[name] = { value, type: inferUniformType(value) }
    }
    return new Pixi.UniformGroup(structures)
}

// uProjectionMatrix/uWorldTransformMatrix (camera/stage) and uTransformMatrix
// (this mesh's own local transform) are Pixi v8's built-in per-draw uniforms
// — GlMeshAdaptor.execute() binds them (as well as the reserved uColor/
// uRound/uResolution/uWorldColorAlpha names below) to every Mesh regardless
// of whether it uses a custom shader, so our own uniform names must avoid
// colliding with them or WebGL throws "Uniform size does not match uniform
// method" (a same-named uniform declared with a different type/size here
// than in Pixi's reserved bind groups).
export const CommonVertexShaderGlobals = `
    precision mediump float;
    attribute vec2 aVerts;
    attribute vec2 aUvs;
    uniform float uAspectRatio;
    uniform mat3 uProjectionMatrix;
    uniform mat3 uWorldTransformMatrix;
    uniform mat3 uTransformMatrix;
    uniform float uTime;
    varying vec2 vUvs;
`
export const BasicVertexShader =
    CommonVertexShaderGlobals +
    `
    void main() {
        vUvs = aUvs;
        mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
        gl_Position = vec4((mvp * vec3(aVerts, 1.0)).xy, 0.0, 1.0);
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
        uniform vec3 uBrushColor;
        uniform float uAlpha;
        void main() {
            vec2 uv = vUvs;
            uv = vec2(uv.x * uAspectRatio, uv.y);
            gl_FragColor = texture2D(uSampler2, uv) * vec4(uBrushColor.rgb, uAlpha);
        }`
)
