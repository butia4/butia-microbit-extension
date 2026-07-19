import { Vec2Like } from "../../shared/types/vec2"
import { RenderObject } from "../rendering/renderer"
import { PhysicsObject } from "../physics/physics"

// Consolidated bot-facing view used by wheels, sensors, and chassis. Replaces
// the 5 near-identical `BotRef` type aliases that used to live one per file
// (wheel.ts, chassis.ts, rangeSensor.ts, lightSensor.ts, graySensor.ts,
// surfaceSensor.ts) — `Bot` (sim/bot/index.ts) already structurally satisfies
// this shape via its public getters/fields, so call sites can pass `this`
// directly with no `as unknown as any` cast.
//
// Deviation from design's Interfaces snippet: `entity.physicsObj` is typed
// as the full `PhysicsObject` class here, not the narrower `{ body: Planck.Body }`
// shown in design. Wheel.update()/updateFriction()/updateForce() call
// `addFrictionJoint`, `getWorldPoint`, `applyForce`, etc. — not just `.body`
// — so the narrower shape would not type-check for wheel.ts once it drops
// its own `BotRef` cast. Sensor classes only ever read `.body`, so widening
// this field is a superset and doesn't affect them.
export type BotHandle = {
    entity: { physicsObj: PhysicsObject; renderObj?: RenderObject }
    pos: Vec2Like
    angle: number
    forward: Vec2Like
    held: boolean
    paused: boolean
}
