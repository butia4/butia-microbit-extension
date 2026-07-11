import { describe, it, expect } from "vitest"
import Physics from "./physics"
import { EntitySpec, defaultShapePhysics, defaultColorBrush } from "./specs"

function makeDraggableSpec(pos = { x: 10, y: 10 }): EntitySpec {
    return {
        pos, angle: 0,
        physics: { type: "dynamic", angularDamping: 0.9, linearDamping: 3 },
        shapes: [{
            type: "circle", radius: 5, roles: ["mouse-target"],
            offset: { x: 0, y: 0 }, angle: 0,
            physics: defaultShapePhysics(),
            brush: defaultColorBrush(),
        }],
    }
}

function makeNonTargetSpec(pos = { x: 10, y: 10 }): EntitySpec {
    return {
        pos, angle: 0,
        physics: { type: "dynamic", angularDamping: 0.9, linearDamping: 3 },
        shapes: [{
            type: "circle", radius: 5, roles: [],
            offset: { x: 0, y: 0 }, angle: 0,
            physics: defaultShapePhysics(),
            brush: defaultColorBrush(),
        }],
    }
}

describe("Physics mouse-drag damping reduction/restoration", () => {
    it("reduces linearDamping (/3) and angularDamping (*2/3) and creates a MouseJoint on mouseDown", () => {
        const physics = new Physics()
        const obj = physics.createObject(makeDraggableSpec())

        physics.mouseDown({ x: 10, y: 10 })

        expect(physics.mouseJoint).toBeDefined()
        expect(obj.body.getLinearDamping()).toBeCloseTo(1) // 3 / 3
        expect(obj.body.getAngularDamping()).toBeCloseTo(0.6) // 0.9 * 2/3
    })

    it("restores the originally cached damping values when the drag ends via mouseUp", () => {
        const physics = new Physics()
        const obj = physics.createObject(makeDraggableSpec())

        physics.mouseDown({ x: 10, y: 10 })
        physics.mouseUp({ x: 10, y: 10 })

        expect(physics.mouseJoint).toBeUndefined()
        expect(obj.body.getLinearDamping()).toBeCloseTo(3)
        expect(obj.body.getAngularDamping()).toBeCloseTo(0.9)
    })

    it("does not create a joint or touch damping for a body without the mouse-target role", () => {
        const physics = new Physics()
        const obj = physics.createObject(makeNonTargetSpec())

        physics.mouseDown({ x: 10, y: 10 })

        expect(physics.mouseJoint).toBeUndefined()
        expect(obj.body.getLinearDamping()).toBeCloseTo(3)
        expect(obj.body.getAngularDamping()).toBeCloseTo(0.9)
    })
})
