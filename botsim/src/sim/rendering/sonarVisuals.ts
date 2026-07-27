import * as Pixi from "pixi.js"
import { Vec2, Vec2Like } from "../../shared/types/vec2"
import { RENDER_SCALE } from "../../shared/constants"
import { toRadians } from "../../shared/util"
import {
    defaultEntityShape, defaultPolygonShape, defaultShapePhysics, defaultShaderBrush, EntityPolygonShapeSpec,
} from "../entitySpec"
import { Rgb, rgbToFloatArray, rgbToString, toRenderScale } from "./util"
import { RenderObject } from "./renderer"
import { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals, registerTimedRedraw } from "./shaderRegistry"
import { createGraphics } from "./meshFactory"

export const DEFAULT_GRAY_COLOR_ANGLE = 70 // degrees
export const GRAY_MAX_RANGE = 5 // cm, matches SURFACE_ON_VALUE

const PING_RADIUS = 3 // cm

// distinct saturated hues chosen for contrast against every map's floor/obstacle colors
export const SONAR_COLORS: Record<"range" | "gray" | "light" | "surface", { wave: Rgb; ping: Rgb }> = {
    range:   { wave: { r: 0x8c, g: 0x6b, b: 0xff }, ping: { r: 0x8c, g: 0x6b, b: 0xff } }, // violet-blue
    gray:    { wave: { r: 0xff, g: 0x3d, b: 0xb5 }, ping: { r: 0xff, g: 0x3d, b: 0xb5 } }, // vivid magenta
    light:   { wave: { r: 0x2f, g: 0xe6, b: 0xc7 }, ping: { r: 0x2f, g: 0xe6, b: 0xc7 } }, // vivid teal
    surface: { wave: { r: 0x39, g: 0xff, b: 0x14 }, ping: { r: 0x39, g: 0xff, b: 0x14 } }, // vivid green
}

const WAVE_RING_COUNT = 3
const WAVE_CYCLE_SECS = 2.2 // time for one ring to travel apex -> maxRange
const WAVE_FILL_ALPHA = 0.08 // constant translucent wedge marking the beam's field of view
const WAVE_RING_ALPHA = 0.85 // peak opacity of a traveling ring, at the middle of its fade envelope
const WAVE_RING_WIDTH_PX = 2

addShaderProgram(
    "sonar_ping",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
    uniform vec3 uBrushColor;

    float dist(vec2 p0, vec2 p1) {
        return sqrt(pow(p1.x - p0.x, 2.) + pow(p1.y - p0.y, 2.));
    }
    void main() {
        vec2 uv = vUvs;
        uv = vec2(uv.x * uAspectRatio, uv.y);
        float innerMargin = 0.1;
        float outerMargin = 0.05;
        float pingDuration = 1.;
        float pingSpeed = 0.5;
        float r = dist(uv, vec2(0.5, 0.5));
        float time = mod(uTime, pingDuration) * pingSpeed;
        float alpha = smoothstep(time - innerMargin, time, r) * smoothstep(time + outerMargin, time, r);
        float fade = smoothstep(0.5, 0., r);
        vec4 color = vec4(uBrushColor * alpha * fade, alpha * fade);
        gl_FragColor = color;
    }`
)

// showCone builds a persistent wave/cone mesh in addition to the pulse ping;
// set once at build time, never toggled later
export function buildSonarVisuals(
    renderObj: RenderObject | undefined,
    pos: Vec2Like,
    angle: number,
    maxRange: number,
    waveLabel: string,
    targetLabel: string,
    colors: { wave: Rgb; ping: Rgb },
    showCone: boolean = false,
    facingDeg: number = 0,
): void {
    if (!renderObj) return // e.g. in unit tests, where entity is a lightweight mock

    if (showCone) {
        const gfx = new Pixi.Graphics()
        gfx.position.set(toRenderScale(pos.x), toRenderScale(pos.y))
        gfx.angle = facingDeg
        gfx.zIndex = 5

        const halfAngleRad = toRadians(angle) / 2
        const upRad = -Math.PI / 2 // canvas convention: 0=+X clockwise-positive, forward(-Y) is -90deg
        const startRad = upRad - halfAngleRad
        const endRad = upRad + halfAngleRad
        const maxRangePx = toRenderScale(maxRange)
        const waveColor = parseInt(rgbToString(colors.wave).replace("#", "0x"), 16)

        const redraw = (elapsedSecs: number): void => {
            gfx.clear()

            gfx.moveTo(0, 0)
            gfx.arc(0, 0, maxRangePx, startRad, endRad)
            gfx.lineTo(0, 0)
            gfx.fill({ color: waveColor, alpha: WAVE_FILL_ALPHA })

            for (let i = 0; i < WAVE_RING_COUNT; i++) {
                const phase = ((elapsedSecs / WAVE_CYCLE_SECS) + i / WAVE_RING_COUNT) % 1
                const r = phase * maxRangePx
                const fade = Math.sin(Math.PI * phase)
                gfx.arc(0, 0, r, startRad, endRad)
                    .stroke({ width: WAVE_RING_WIDTH_PX, color: waveColor, alpha: fade * WAVE_RING_ALPHA })
            }
        }

        registerTimedRedraw(gfx, redraw)
        renderObj.addShape(waveLabel, gfx)
    }

    const targetSpec: EntityPolygonShapeSpec = {
        ...defaultEntityShape(),
        ...defaultPolygonShape(),
        label: targetLabel,
        offset: { x: 0, y: 0 },
        verts: [
            { x: -PING_RADIUS, y: -PING_RADIUS },
            { x: PING_RADIUS, y: -PING_RADIUS },
            { x: PING_RADIUS, y: PING_RADIUS },
            { x: -PING_RADIUS, y: PING_RADIUS },
        ],
        roles: [],
        physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
        brush: {
            ...defaultShaderBrush(),
            shader: "sonar_ping",
            uniforms: { uBrushColor: rgbToFloatArray(colors.ping) },
            visible: false,
            zIndex: 6,
        },
    }

    const targetGfx = createGraphics.polygon.shader(targetSpec, targetSpec.brush)
    renderObj.addShape(targetLabel, targetGfx)
}

export function updateSonarVisuals(
    shapes: RenderObject["shapes"] | undefined,
    used: boolean,
    nearest: Vec2Like | undefined,
    targetLabel: string,
    botPos: Vec2Like,
    botAngle: number,
): void {
    if (!shapes) return // e.g. in unit tests, where entity is a lightweight mock

    const target = shapes.get(targetLabel)
    if (target) {
        target.visible = used && !!nearest
        if (nearest) {
            const local = Vec2.scale(Vec2.untransformDeg(nearest, botPos, botAngle), RENDER_SCALE)
            target.position.set(local.x, local.y)
        }
    }
}
