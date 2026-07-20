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

// Default beam orientation/range for gray/color/surface sensors, used when a
// connector's spec.angle is unset. RangeSensor keeps its own separate default
// (DEFAULT_RANGE_ANGLE, in rangeSensor.ts) since its beam is much longer.
export const DEFAULT_GRAY_COLOR_ANGLE = 70 // degrees
export const GRAY_MAX_RANGE = 5 // cm, matches SURFACE_ON_VALUE

const PING_RADIUS = 3 // cm

// Wave/ping color pairs per sensor type — kept together so they're easy to
// compare/tune for visual distinguishability.
//
// Chosen for contrast against every map background/foreground the ping can
// appear over: the default map's light-gray floor (#E7E9E7) and near-black
// line (#1a1a1a), the table map's dark floor (#2E2E2E) and brown tabletop
// (#C68642), and the obstacle colors (MICROBIT_COLORS: yellow/green/red/
// cyan-blue). `gray`'s old muted gray (0xb0b0b0) is what made the line-map
// pulse hard to see — it sat in the same gray family as the floor itself;
// all four are now distinct, highly saturated hues spaced around the color
// wheel so none of them blend into a map or an obstacle. `surface`'s old
// amber (0xffb300) sat too close in hue to the brown tabletop (#C68642,
// hue ~30° vs. amber's ~43°) to read as a distinct pulse over that map;
// swapped for a vivid green, which is far enough around the wheel from
// brown/orange (and from the other three hues) to stay legible there.
export const SONAR_COLORS: Record<"range" | "gray" | "light" | "surface", { wave: Rgb; ping: Rgb }> = {
    range:   { wave: { r: 0x8c, g: 0x6b, b: 0xff }, ping: { r: 0x8c, g: 0x6b, b: 0xff } }, // violet-blue
    gray:    { wave: { r: 0xff, g: 0x3d, b: 0xb5 }, ping: { r: 0xff, g: 0x3d, b: 0xb5 } }, // vivid magenta
    light:   { wave: { r: 0x2f, g: 0xe6, b: 0xc7 }, ping: { r: 0x2f, g: 0xe6, b: 0xc7 } }, // vivid teal
    surface: { wave: { r: 0x39, g: 0xff, b: 0x14 }, ping: { r: 0x39, g: 0xff, b: 0x14 } }, // vivid green
}

// Ring pulse tuning for the sonar wave (drawn as plain Pixi.Graphics arcs —
// see buildSonarVisuals's showCone branch — not a shader). Pulse-only
// feedback remains the default for all sensor types; only LightSensor opts
// into this persistent cone, per-mount, whenever that mount's
// settings-screen mode is "forward" (see sim/bot/index.ts's
// `showCone = mode === "forward"`).
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

/**
 * Builds the pulse (ping) visual mesh and attaches it to the given render
 * object. Unconditional: always builds a mesh (no "no beam"/skip state).
 * Callers resolve `angle`/`maxRange` defaults (e.g. `spec.angle ?? DEFAULT_*`)
 * before calling this function.
 *
 * The sonar wave/cone mesh (`waveLabel`) is pulse-only (not built) by default
 * for all sensor types, per product decision. Pass `showCone: true` to also
 * build a persistent, always-visible wave/cone mesh — currently only used by
 * `LightSensor`, per-mount, whenever that mount's settings-screen mode is
 * "forward" (see sim/bot/index.ts). Cone visibility is static: set once here
 * at build time, never toggled by `updateSonarVisuals`.
 */
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
        // Drawn as plain vector arcs (moveTo/arc/stroke), not a per-pixel
        // shader — positioned/rotated via the Graphics object's own
        // position/angle (like any other Pixi container: see RenderObject's
        // shapes), so it's always anchored exactly at `pos` and pointed
        // exactly at `facingDeg` for every mount. No UV/bounding-box math to
        // get out of sync, unlike the old shader mesh (which built its verts
        // pre-rotated by facingDeg, distorting the UV space a hand-tuned
        // shader constant relied on for every mount that wasn't front-facing
        // — see git history if this ever needs resurrecting for reference).
        const gfx = new Pixi.Graphics()
        gfx.position.set(toRenderScale(pos.x), toRenderScale(pos.y))
        gfx.angle = facingDeg
        gfx.zIndex = 5

        const halfAngleRad = toRadians(angle) / 2
        // Pixi/canvas angle convention: 0 = +X, clockwise-positive. This
        // cone's forward direction ("up", -Y — matches every other sensor
        // convention in this file) sits at -90deg.
        const upRad = -Math.PI / 2
        const startRad = upRad - halfAngleRad
        const endRad = upRad + halfAngleRad
        const maxRangePx = toRenderScale(maxRange)
        const waveColor = parseInt(rgbToString(colors.wave).replace("#", "0x"), 16)

        const redraw = (elapsedSecs: number): void => {
            gfx.clear()

            // Constant translucent wedge — always-visible field-of-view marker.
            gfx.moveTo(0, 0)
            gfx.arc(0, 0, maxRangePx, startRad, endRad)
            gfx.lineTo(0, 0)
            gfx.fill({ color: waveColor, alpha: WAVE_FILL_ALPHA })

            // WAVE_RING_COUNT rings travel apex -> maxRange on a loop,
            // staggered evenly in phase, fading in/out (0 at both ends of
            // their travel, peak at the midpoint) instead of popping in/out.
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

/**
 * Toggles the ping mesh's visibility and positions it at the nearest
 * detected point, mirroring RangeSensor's original updateVisuals().
 *
 * The wave/cone visual and its `mode` selection (which used to decide
 * whether the wave, the ping, or either could show) are disabled per product
 * decision to use pulse-only feedback for all sensor types — all sensors now
 * only ever show the ping.
 */
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
