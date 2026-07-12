import { describe, it, expect } from "vitest"
import Renderer from "./renderer"

// Renderer's constructor instantiates a real Pixi.Application, which is
// unnecessary and slow for testing a method that only touches the canvas
// element's style. Bypass the constructor and inject a lightweight `pixi`
// stub so we exercise the real `setCanvasCursor` implementation directly.
function makeRendererWithView(): { renderer: Renderer; view: HTMLCanvasElement } {
    const view = document.createElement("canvas")
    const renderer = Object.create(Renderer.prototype) as Renderer
    ;(renderer as unknown as { pixi: { canvas: HTMLCanvasElement } }).pixi = { canvas: view }
    return { renderer, view }
}

describe("Renderer.setCanvasCursor", () => {
    it("sets the canvas element's cursor style to the given value", () => {
        const { renderer, view } = makeRendererWithView()

        renderer.setCanvasCursor("grabbing")

        expect(view.style.cursor).toBe("grabbing")
    })

    it("updates the cursor style across multiple calls with different values", () => {
        const { renderer, view } = makeRendererWithView()

        renderer.setCanvasCursor("grab")
        expect(view.style.cursor).toBe("grab")

        renderer.setCanvasCursor("default")
        expect(view.style.cursor).toBe("default")
    })
})
