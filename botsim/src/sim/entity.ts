import { Vec2Like } from "../types/vec2"
import { RenderObject } from "./renderer"
import { PhysicsObject } from "./physics"

export class Entity {
    private _renderObj!: RenderObject
    private _physicsObj!: PhysicsObject
    public label: string | undefined

    public get renderObj() { return this._renderObj }
    public get physicsObj() { return this._physicsObj }
    public get pos(): Vec2Like { return this._physicsObj.pos }
    public get angle(): number { return this._physicsObj.angle }

    public init(renderObj: RenderObject, physicsObj: PhysicsObject): void {
        this._renderObj = renderObj
        this._physicsObj = physicsObj
        this._renderObj.sync()
    }

    public update(dtSecs: number): void {
        this._physicsObj.update(dtSecs)
        this._renderObj.update(dtSecs)
    }

    public destroy(): void {
        this._renderObj.destroy()
        this._physicsObj.destroy()
    }
}
