import { Vec2Like } from "../shared/types/vec2"

// --- Shape types ---

export type ShapeType = "path" | "box" | "circle" | "polygon" | "edge"

type ShapeCommonSpec = {
    type: ShapeType
    label?: string
    roles: string[]
}

export type PathShapeSpec = ShapeCommonSpec & {
    type: "path"
    verts: Vec2Like[]
    width: number
    closed: boolean
    stepSize: number
}

export type BoxShapeSpec = ShapeCommonSpec & {
    type: "box"
    size: Vec2Like
    halign: "left" | "center" | "right"
    valign: "top" | "center" | "bottom"
}

export type CircleShapeSpec = ShapeCommonSpec & {
    type: "circle"
    radius: number
}

export type PolygonShapeSpec = ShapeCommonSpec & {
    type: "polygon"
    verts: Vec2Like[]
}

export type EdgeShapeSpec = ShapeCommonSpec & {
    type: "edge"
    v0: Vec2Like
    v1: Vec2Like
}

export type ShapeSpec = PathShapeSpec | BoxShapeSpec | CircleShapeSpec | PolygonShapeSpec | EdgeShapeSpec

// --- Physics ---

export type ShapePhysicsSpec = {
    density: number
    friction: number
    restitution: number
    sensor: boolean
    maskBits?: number
    categoryBits?: number
}

export const defaultShapePhysics = (): ShapePhysicsSpec => ({
    density: 0.1, friction: 0.2, restitution: 0.2, sensor: false,
})

// --- Brushes ---

export type BrushType = "color" | "texture" | "shader"

export type ColorBrushSpec = {
    type: "color"
    visible: boolean
    zIndex?: number
    borderColor: string
    borderWidth: number
    fillColor: string
    // Circle-only: renders as a radial gradient fading from fillColor to
    // transparent instead of a flat fill, with no border — used for glow/halo
    // effects (e.g. the light-source map's light bulb).
    glow?: boolean
}

export type TextureBrushSpec = {
    type: "texture"
    visible: boolean
    zIndex?: number
    texture: string
    color: string
    alpha: number
}

export type ShaderBrushSpec = {
    type: "shader"
    visible: boolean
    zIndex?: number
    shader: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uniforms: { [key: string]: any }
}

export type BrushSpec = ColorBrushSpec | TextureBrushSpec | ShaderBrushSpec

export const defaultColorBrush = (): ColorBrushSpec => ({
    type: "color", visible: true, zIndex: 0,
    borderColor: "#FF1053", borderWidth: 0.25, fillColor: "#EAD637",
})

export const defaultTextureBrush = (): TextureBrushSpec => ({
    type: "texture", visible: true, zIndex: 0,
    texture: "placeholder.png", color: "#FFFFFF", alpha: 1,
})

export const defaultShaderBrush = (): ShaderBrushSpec => ({
    type: "shader", visible: true, zIndex: 0,
    shader: "default", uniforms: {},
})

// --- Entity shapes (shape spec + offset/angle/physics/brush) ---

type EntityShapeCommonSpec = {
    offset: Vec2Like
    angle: number
    physics: ShapePhysicsSpec
    brush: BrushSpec
}

export type EntityBoxShapeSpec    = BoxShapeSpec    & EntityShapeCommonSpec
export type EntityCircleShapeSpec = CircleShapeSpec & EntityShapeCommonSpec
export type EntityPolygonShapeSpec= PolygonShapeSpec& EntityShapeCommonSpec
export type EntityEdgeShapeSpec   = EdgeShapeSpec   & EntityShapeCommonSpec
export type EntityPathShapeSpec   = PathShapeSpec   & EntityShapeCommonSpec
export type EntityShapeSpec =
    | EntityBoxShapeSpec | EntityCircleShapeSpec
    | EntityPolygonShapeSpec | EntityEdgeShapeSpec | EntityPathShapeSpec

export const defaultBoxShape = (): BoxShapeSpec => ({
    type: "box", size: { x: 20, y: 20 }, halign: "center", valign: "center", roles: [],
})

export const defaultCircleShape = (): CircleShapeSpec => ({
    type: "circle", radius: 10, roles: [],
})

export const defaultPolygonShape = (): PolygonShapeSpec => ({
    type: "polygon", verts: [], roles: [],
})

export const defaultEdgeShape = (): EdgeShapeSpec => ({
    type: "edge", v0: { x: 0, y: 0 }, v1: { x: 20, y: 20 }, roles: [],
})

export const defaultPathShape = (): PathShapeSpec => ({
    type: "path", verts: [], width: 3, closed: true, stepSize: 0.2, roles: [],
})

export const defaultEntityShape = (): EntityShapeSpec => ({
    ...defaultBoxShape(),
    offset: { x: 0, y: 0 }, angle: 0,
    physics: defaultShapePhysics(),
    brush: defaultColorBrush(),
})

// --- Entity ---

export type EntityPhysicsSpec = {
    type: "dynamic" | "static"
    angularDamping: number
    linearDamping: number
    fixedRotation?: boolean
}

export const defaultDynamicPhysics = (): EntityPhysicsSpec => ({
    type: "dynamic", angularDamping: 0, linearDamping: 0,
})

export const defaultStaticPhysics = (): EntityPhysicsSpec => ({
    type: "static", angularDamping: 0, linearDamping: 0,
})

export type EntitySpec = {
    label?: string
    pos: Vec2Like
    angle: number
    physics: EntityPhysicsSpec
    shapes: EntityShapeSpec[]
}

export const defaultEntity = (): EntitySpec => ({
    pos: { x: 20, y: 20 }, angle: 0,
    physics: defaultDynamicPhysics(),
    shapes: [],
})
