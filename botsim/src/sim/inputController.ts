import Physics from "./physics/physics"
import Renderer from "./rendering/renderer"
import { Vec2Like } from "../shared/types/vec2"

// Extracted from Simulation — converts canvas-pixel coordinates (from DOM
// mouse events, CSS-scaled) into simulation-space (cm) coordinates, then
// delegates to Physics. Exactly one body (bot or obstacle) can be dragged
// at a time. Also owns the cursor-feedback logic (grab/grabbing/default)
// based on the current drag/hover state.
export class InputController {
    private _lastMousePos: Vec2Like = { x: 0, y: 0 }

    public get lastMousePos(): Vec2Like { return this._lastMousePos }
    public set lastMousePos(pos: Vec2Like) { this._lastMousePos = pos }

    constructor(private physics: Physics, private renderer: Renderer) { }

    private canvasToSimPos(canvasPos: Vec2Like): Vec2Like {
        const canvasSize = this.renderer.canvasSize
        const logicalSize = this.renderer.logicalSize
        return {
            x: (canvasPos.x / canvasSize.x) * logicalSize.x,
            y: (canvasPos.y / canvasSize.y) * logicalSize.y,
        }
    }

    public mouseDown(canvasPos: Vec2Like): void {
        this._lastMousePos = this.canvasToSimPos(canvasPos)
        this.physics.mouseDown(this._lastMousePos)
    }

    public mouseMove(canvasPos: Vec2Like): void {
        this._lastMousePos = this.canvasToSimPos(canvasPos)
        this.physics.mouseMove(this._lastMousePos)
    }

    public mouseUp(canvasPos: Vec2Like): void {
        this.physics.mouseUp(this.canvasToSimPos(canvasPos))
    }

    public updateCursor(): void {
        if (this.physics.mouseJoint) {
            this.renderer.setCanvasCursor("grabbing")
        } else {
            this.renderer.setCanvasCursor(this.physics.isMouseTarget(this._lastMousePos) ? "grab" : "default")
        }
    }
}
