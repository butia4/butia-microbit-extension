import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"

// Simulation's constructor directly instantiates Physics and Renderer,
// which pull in Planck (physics) and Pixi (rendering). For testing the
// loop-gating and cursor logic we don't need real physics/rendering, so
// mock both modules with lightweight spies.
// Vitest 4 requires a mock used with `new` to be backed by a real function/
// class, not an arrow function — mockImplementation(() => ({...})) triggers
// "is not a constructor" when Simulation does `new Physics()`/`new Renderer()`.
vi.mock("./physics", () => ({
    default: vi.fn().mockImplementation(function () {
        return {
            mouseJoint: undefined,
            isMouseTarget: vi.fn(() => false),
            update: vi.fn(),
            createObject: vi.fn(),
            mouseDown: vi.fn(),
            mouseMove: vi.fn(),
            mouseUp: vi.fn(),
            reinit: vi.fn(),
        }
    }),
}))

vi.mock("./renderer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./renderer")>()
    return {
        ...actual,
        default: vi.fn().mockImplementation(function () {
            return {
                init: vi.fn(() => Promise.resolve()),
                setCanvasCursor: vi.fn(),
                update: vi.fn(),
                canvasSize: { x: 100, y: 100 },
                logicalSize: { x: 90, y: 90 },
                createRenderObj: vi.fn(),
                resize: vi.fn(),
                color: vi.fn(),
                reinit: vi.fn(),
                mountTo: vi.fn(),
            }
        }),
    }
})

type SimInternals = {
    loop: (now: number) => void
    updateCursor: () => void
    mouseDown: (p: { x: number; y: number }) => void
    mouseMove: (p: { x: number; y: number }) => void
    running: boolean
    paused: boolean
    lastTime: number
    lastPhysicsTime: number
    _lastMousePos: { x: number; y: number }
    _physics: {
        mouseJoint: unknown
        isMouseTarget: Mock
        update: Mock
    }
    _renderer: {
        setCanvasCursor: Mock
        update: Mock
    }
    _bot: { update: Mock } | null
    _entities: unknown[]
}

async function makeSim(): Promise<SimInternals> {
    vi.resetModules()
    const { Simulation } = await import("./index")
    const sim = Simulation.instance as unknown as SimInternals
    sim.running = true
    sim.paused = false
    sim.lastTime = 0
    sim.lastPhysicsTime = 0
    sim._bot = { update: vi.fn() }
    sim._entities = []
    return sim
}

describe("Simulation fixed-timestep physics stepping", () => {
    beforeEach(() => {
        vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0)
    })

    it("does not step physics before the fixed interval elapses, but still renders", async () => {
        const sim = await makeSim()

        sim.loop(5) // 5ms < 1000/60 (~16.67ms)

        expect(sim._physics.update).not.toHaveBeenCalled()
        expect(sim._bot?.update).not.toHaveBeenCalled()
        expect(sim._renderer.update).toHaveBeenCalledTimes(1)
    })

    it("steps physics with a fixed 1/60 delta once the interval elapses", async () => {
        const sim = await makeSim()

        sim.loop(20) // 20ms >= 1000/60

        expect(sim._physics.update).toHaveBeenCalledWith(1 / 60)
        expect(sim._bot?.update).toHaveBeenCalledWith(1 / 60)
    })
})

describe("Simulation cursor feedback", () => {
    beforeEach(() => {
        vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0)
    })

    it("shows a grabbing cursor while a mouse joint is active", async () => {
        const sim = await makeSim()
        sim._physics.mouseJoint = {}

        sim.updateCursor()

        expect(sim._renderer.setCanvasCursor).toHaveBeenCalledWith("grabbing")
    })

    it("shows a grab cursor when hovering a draggable body with no active drag", async () => {
        const sim = await makeSim()
        sim._physics.mouseJoint = undefined
        sim._physics.isMouseTarget = vi.fn(() => true)
        sim._lastMousePos = { x: 3, y: 4 }

        sim.updateCursor()

        expect(sim._physics.isMouseTarget).toHaveBeenCalledWith({ x: 3, y: 4 })
        expect(sim._renderer.setCanvasCursor).toHaveBeenCalledWith("grab")
    })

    it("shows the default cursor when idle (no drag, not hovering a bot)", async () => {
        const sim = await makeSim()
        sim._physics.mouseJoint = undefined
        sim._physics.isMouseTarget = vi.fn(() => false)

        sim.updateCursor()

        expect(sim._renderer.setCanvasCursor).toHaveBeenCalledWith("default")
    })

    it("tracks the last mouse position (in sim space) from mouseDown", async () => {
        const sim = await makeSim()

        sim.mouseDown({ x: 50, y: 50 })

        // canvasSize 100x100, logicalSize 90x90 → (50/100)*90 = 45
        expect(sim._lastMousePos).toEqual({ x: 45, y: 45 })
    })
})
