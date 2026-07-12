import { Vec2, Vec2Like } from "../../types/vec2"
import { RENDER_SCALE } from "../../constants"
// import { toRadians } from "../../util" // only needed by the disabled sonar wave mesh below
import {
    defaultEntityShape, defaultPolygonShape, defaultShapePhysics, defaultShaderBrush, EntityPolygonShapeSpec,
} from "../specs"
import { Rgb, rgbToFloatArray } from "../util"
// import { appoximateArc, toRenderScale } from "../util" // only needed by the disabled sonar wave mesh below
import { addShaderProgram, BasicVertexShader, CommonFragmentShaderGlobals, createGraphics, RenderObject } from "../renderer"

// Default beam orientation/range for gray/color/surface sensors, used when a
// connector's spec.angle is unset. RangeSensor keeps its own separate default
// (DEFAULT_RANGE_ANGLE, in rangeSensor.ts) since its beam is much longer.
export const DEFAULT_GRAY_COLOR_ANGLE = 70 // degrees
export const GRAY_MAX_RANGE = 5 // cm, matches SURFACE_ON_VALUE

const PING_RADIUS = 3 // cm

// Nudges only the wave/cone mesh's anchor a bit to the right of the sensor's
// actual mount point (`pos`, from sensorMounts), independent of it — the
// ping/target always tracks `pos` live (recomputed every frame), so tuning
// sensorMounts alone can't reposition the cone. Tune this value directly.
// const WAVE_OFFSET_X = 2.5 // cm // only needed by the disabled sonar wave mesh below

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
// wheel so none of them blend into a map or an obstacle.
export const SONAR_COLORS: Record<"range" | "gray" | "color" | "surface", { wave: Rgb; ping: Rgb }> = {
    range:   { wave: { r: 0x8c, g: 0x6b, b: 0xff }, ping: { r: 0x8c, g: 0x6b, b: 0xff } }, // violet-blue
    gray:    { wave: { r: 0xff, g: 0x3d, b: 0xb5 }, ping: { r: 0xff, g: 0x3d, b: 0xb5 } }, // vivid magenta
    color:   { wave: { r: 0x2f, g: 0xe6, b: 0xc7 }, ping: { r: 0x2f, g: 0xe6, b: 0xc7 } }, // vivid teal
    surface: { wave: { r: 0xff, g: 0xb3, b: 0x00 }, ping: { r: 0xff, g: 0xb3, b: 0x00 } }, // vivid amber
}

// Sonar wave shader (cone/beam animation) — disabled per product decision to
// use pulse-only feedback for all sensor types (see buildSonarVisuals /
// updateSonarVisuals below). Kept commented, not deleted, in case the wave
// animation is reintroduced in the future.
//
// Ported near-verbatim from microbit-robot/botsim/src/sim/bot/rangeSensor.ts
// (moved here from rangeSensor.ts so all sonar-beam sensors share one shader
// registration instead of duplicating it per sensor class).
// addShaderProgram(
//     "sonar_wave",
//     BasicVertexShader,
//     CommonFragmentShaderGlobals +
//         `
//     uniform vec3 uColor;
//     uniform float uMaxRange;
//     uniform float uBeamAngle;
//
//     float dist(vec2 p0, vec2 p1) {
//         return sqrt(pow(p1.x - p0.x, 2.) + pow(p1.y - p0.y, 2.));
//     }
//     float angle(vec2 p0, vec2 p1) {
//         return atan(p1.y - p0.y, p1.x - p0.x) + 1.57;
//     }
//     void main() {
//         vec2 uv = vUvs;
//         uv = vec2(uv.x * uAspectRatio, uv.y);
//         vec2 ofs = vec2(0.265, 1.1); // hand-tuned to appear to emanate from the sensor
//         float maxRange = uMaxRange + ofs.y;
//         float maxAngle = uBeamAngle / 2.;
//         float waveSpeed = 5.;
//         float waveCount = 22.;
//         float d = dist(ofs, uv);
//         float c = mod(uTime * waveSpeed - d * waveCount, 1.);
//         c = 1. - c;
//         c = c * c;
//         c = .2 + c * .66;
//         float alpha = c * .75;
//         float linFade = 1. - smoothstep(0., 1., d - 0.33);
//         float angFade = 1. - smoothstep(0., 1., -0.5 + abs(angle(ofs, uv)) / maxAngle);
//         alpha *= linFade * angFade;
//         gl_FragColor = vec4(uColor * alpha, alpha);
//     }`
// )

addShaderProgram(
    "sonar_ping",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
    uniform vec3 uColor;

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
        vec4 color = vec4(uColor * alpha * fade, alpha * fade);
        gl_FragColor = color;
    }`
)

/**
 * Builds the pulse (ping) visual mesh and attaches it to the given render
 * object. Unconditional: always builds a mesh (no "no beam"/skip state).
 * Callers resolve `angle`/`maxRange` defaults (e.g. `spec.angle ?? DEFAULT_*`)
 * before calling this function.
 *
 * The sonar wave/cone mesh (`_waveLabel`) is disabled per product decision to
 * use pulse-only feedback for all sensor types — its build logic is kept
 * commented below rather than deleted, in case it's reintroduced later.
 * `_pos`/`_angle`/`_maxRange`/`_waveLabel` are only consumed by that disabled
 * code path; the leading underscore silences `noUnusedParameters` in the
 * meantime.
 */
export function buildSonarVisuals(
    renderObj: RenderObject | undefined,
    _pos: Vec2Like,
    _angle: number,
    _maxRange: number,
    _waveLabel: string,
    targetLabel: string,
    colors: { wave: Rgb; ping: Rgb },
): void {
    if (!renderObj) return // e.g. in unit tests, where entity is a lightweight mock

    // const hw = 2
    // const pLN = Vec2.like(-hw, 0)
    // const pRN = Vec2.like(hw, 0)
    // const pLF = Vec2.rotateDeg(Vec2.add(pLN, Vec2.like(0, -maxRange)), -angle / 2)
    // const pRF = Vec2.rotateDeg(Vec2.add(pRN, Vec2.like(0, -maxRange)),  angle / 2)
    // const arc = appoximateArc({ x: 0, y: 0 }, maxRange, -angle / 2 - 90, angle / 2 - 90, 4)
    // const verts = [pLN, pRN, pRF, ...arc.reverse(), pLF, pLN]

    // const waveSpec: EntityPolygonShapeSpec = {
    //     ...defaultEntityShape(),
    //     ...defaultPolygonShape(),
    //     label: waveLabel,
    //     offset: { x: pos.x + WAVE_OFFSET_X, y: pos.y },
    //     verts,
    //     roles: [],
    //     physics: { ...defaultShapePhysics(), sensor: true, density: 0 },
    //     brush: {
    //         ...defaultShaderBrush(),
    //         shader: "sonar_wave",
    //         uniforms: {
    //             uColor: rgbToFloatArray(colors.wave),
    //             uMaxRange: toRenderScale(maxRange),
    //             uBeamAngle: toRadians(angle),
    //         },
    //         visible: false,
    //         zIndex: 5,
    //     },
    // }
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
            uniforms: { uColor: rgbToFloatArray(colors.ping) },
            visible: false,
            zIndex: 6,
        },
    }

    // const waveGfx = createGraphics.polygon.shader(waveSpec, waveSpec.brush)
    // renderObj.addShape(waveLabel, waveGfx)
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
 * only ever show the ping. Kept commented, not deleted, in case the wave
 * animation is reintroduced in the future. `_waveLabel` is only consumed by
 * that disabled code path; the leading underscore silences
 * `noUnusedParameters` in the meantime.
 */
export function updateSonarVisuals(
    shapes: RenderObject["shapes"] | undefined,
    used: boolean,
    nearest: Vec2Like | undefined,
    _waveLabel: string,
    targetLabel: string,
    botPos: Vec2Like,
    botAngle: number,
): void {
    if (!shapes) return // e.g. in unit tests, where entity is a lightweight mock

    // const wave = shapes.get(waveLabel)
    // if (wave) wave.visible = used && mode !== "target"

    const target = shapes.get(targetLabel)
    if (target) {
        target.visible = used && !!nearest
        if (nearest) {
            const local = Vec2.scale(Vec2.untransformDeg(nearest, botPos, botAngle), RENDER_SCALE)
            target.position.set(local.x, local.y)
        }
    }
}
