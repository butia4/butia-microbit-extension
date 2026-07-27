import * as Pixi from "pixi.js"

/*********************************************************************
 * SHADERS
 ********************************************************************/

// built lazily on first use: Pixi.GlProgram.from() probes WebGL, unavailable under jsdom/vitest
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

// each shaded mesh gets its own uTime uniform, advanced every frame (Pixi v8 has no global uniform)
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

// uProjectionMatrix/uWorldTransformMatrix/uTransformMatrix are Pixi v8 reserved uniform
// names bound to every Mesh; custom uniforms must avoid colliding with them
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
