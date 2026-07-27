import { Vec2Like } from "../../shared/types/vec2"
import { RenderObject } from "../rendering/renderer"
import { PhysicsObject } from "../physics/physics"

export type BotHandle = {
    entity: { physicsObj: PhysicsObject; renderObj?: RenderObject }
    pos: Vec2Like
    angle: number
    forward: Vec2Like
    held: boolean
    paused: boolean
}
