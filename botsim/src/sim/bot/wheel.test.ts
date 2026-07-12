import { describe, it, expect, vi, beforeEach } from "vitest"
import { Wheel, WHEEL_DENSITY } from "./wheel"
import type { BotHandle } from "./botHandle"
import type { WheelSpec } from "../../botSpecs/botSpec"

function makeMockFrictionJoint() {
    return {
        m_bodyB: { setAngularDamping: vi.fn(), setLinearDamping: vi.fn() },
        getMaxForce: (): number => 100,
        getMaxTorque: (): number => 50,
        setMaxForce: vi.fn(),
        setMaxTorque: vi.fn(),
    }
}

function makeMockPhysicsObj(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        body: {
            getInertia: vi.fn(() => 2),
            getMass: vi.fn(() => 10),
        },
        addFrictionJoint: vi.fn((): ReturnType<typeof makeMockFrictionJoint> | undefined => makeMockFrictionJoint()),
        getWorldPoint: vi.fn((p: { x: number; y: number }) => p),
        getAngularVelocity: vi.fn(() => 0),
        setAngularVelocity: vi.fn(),
        applyAngularForce: vi.fn(),
        getLateralVelocity: vi.fn(() => ({ x: 0, y: 0 })),
        applyForce: vi.fn(),
        ...overrides,
    }
}

function makeMockBot(physicsObj: ReturnType<typeof makeMockPhysicsObj>): BotHandle {
    return {
        entity: { physicsObj: physicsObj as unknown as BotHandle["entity"]["physicsObj"] },
        pos: { x: 0, y: 0 },
        angle: 0,
        forward: { x: 0, y: -1 },
        held: false,
        paused: false,
    }
}

const spec: WheelSpec = { name: "left", maxSpeed: 100, dashTime: 0.5, pos: { x: -3, y: 2 }, width: 2, radius: 3 }

describe("Wheel.makeShapeSpec", () => {
    it("builds a box shape spec sized by wheel width/radius with the WHEEL_DENSITY", () => {
        const shapeSpec = Wheel.makeShapeSpec(undefined, spec)
        expect(shapeSpec.type).toBe("box")
        expect((shapeSpec as { size: { x: number; y: number } }).size).toEqual({ x: 2, y: 6 })
        expect(shapeSpec.physics.density).toBe(WHEEL_DENSITY)
        expect(shapeSpec.roles).toEqual(["mouse-target", "robot"])
        expect(shapeSpec.label).toBe("left")
    })
})

describe("Wheel constructor", () => {
    it("registers a friction joint against the ground and caches its strength", () => {
        const physicsObj = makeMockPhysicsObj()
        const bot = makeMockBot(physicsObj)

        new Wheel(bot, spec)

        expect(physicsObj.addFrictionJoint).toHaveBeenCalledWith(spec.pos)
    })

    it("tolerates addFrictionJoint returning undefined", () => {
        const physicsObj = makeMockPhysicsObj({ addFrictionJoint: vi.fn(() => undefined) })
        const bot = makeMockBot(physicsObj)

        expect(() => new Wheel(bot, spec)).not.toThrow()
    })
})

describe("Wheel.setSpeed", () => {
    it("clamps the requested speed to +/- maxSpeed", () => {
        const bot = makeMockBot(makeMockPhysicsObj())
        const wheel = new Wheel(bot, spec)

        wheel.setSpeed(500)
        wheel.update(1 / 60)
        const applyForce = (bot.entity.physicsObj as unknown as ReturnType<typeof makeMockPhysicsObj>).applyForce
        expect(applyForce).toHaveBeenCalledTimes(2) // friction force, then drive force
        // Drive force (2nd call): forward = {0,-1}, clamped speed = maxSpeed(100) * 4.5 * mass(10) = 4500
        const [driveForce] = applyForce.mock.calls[1]
        expect(driveForce.y).toBeCloseTo(-4500)
    })
})

describe("Wheel.update", () => {
    let physicsObj: ReturnType<typeof makeMockPhysicsObj>
    let bot: BotHandle

    beforeEach(() => {
        physicsObj = makeMockPhysicsObj()
        bot = makeMockBot(physicsObj)
    })

    it("skips force application while held", () => {
        bot.held = true
        const wheel = new Wheel(bot, spec)
        wheel.setSpeed(50)

        wheel.update(1 / 60)

        expect(physicsObj.applyForce).not.toHaveBeenCalled()
        expect(physicsObj.applyAngularForce).not.toHaveBeenCalled()
    })

    it("skips force application while paused", () => {
        bot.paused = true
        const wheel = new Wheel(bot, spec)
        wheel.setSpeed(50)

        wheel.update(1 / 60)

        expect(physicsObj.applyForce).not.toHaveBeenCalled()
    })

    it("applies angular counter-force and drive force while active", () => {
        const wheel = new Wheel(bot, spec)
        wheel.setSpeed(50)

        wheel.update(1 / 60)

        expect(physicsObj.applyAngularForce).toHaveBeenCalled()
        expect(physicsObj.applyForce).toHaveBeenCalledTimes(2) // friction + drive
    })

    it("caps angular velocity when it exceeds the max threshold", () => {
        physicsObj.getAngularVelocity = vi.fn(() => 20) // above maxAV = 10
        const wheel = new Wheel(bot, spec)

        wheel.update(1 / 60)

        expect(physicsObj.setAngularVelocity).toHaveBeenCalledWith(10)
    })

    it("relaxes the friction joint's max force/torque on the frame it transitions to held", () => {
        const joint = makeMockFrictionJoint()
        physicsObj.addFrictionJoint = vi.fn((): typeof joint | undefined => joint)
        const wheel = new Wheel(bot, spec)

        bot.held = true
        wheel.update(1 / 60)

        expect(joint.setMaxForce).toHaveBeenCalledWith(0)
        expect(joint.setMaxTorque).toHaveBeenCalledWith(0)
    })

    it("restores the friction joint's cached max force/torque on release", () => {
        const joint = makeMockFrictionJoint()
        physicsObj.addFrictionJoint = vi.fn((): typeof joint | undefined => joint)
        const wheel = new Wheel(bot, spec)

        bot.held = true
        wheel.update(1 / 60)
        bot.held = false
        wheel.update(1 / 60)

        expect(joint.setMaxForce).toHaveBeenCalledWith(100)
        expect(joint.setMaxTorque).toHaveBeenCalledWith(50)
    })
})

describe("Wheel.destroy", () => {
    it("is a no-op that does not throw", () => {
        const wheel = new Wheel(makeMockBot(makeMockPhysicsObj()), spec)
        expect(() => wheel.destroy()).not.toThrow()
    })
})
