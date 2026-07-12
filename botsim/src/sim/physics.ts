import * as Planck from "planck"
import { Vec2, Vec2Like } from "../types/vec2"
import { toRadians } from "../util"
import { samplePath } from "./util"
import {
    EntitySpec, EntityShapeSpec,
    EntityBoxShapeSpec, EntityCircleShapeSpec,
    EntityPolygonShapeSpec, EntityEdgeShapeSpec, EntityPathShapeSpec,
} from "./entitySpec"

Planck.Settings.maxPolygonVertices = 64

// planck types don't export FrictionJoint on the default namespace, so
// callers get back this narrow handle instead of the full Planck.Joint type.
export interface FrictionJointHandle {
    setMaxForce(force: number): void
    getMaxForce(): number
    setMaxTorque(torque: number): void
    getMaxTorque(): number
    m_bodyB: { setAngularDamping(v: number): void; setLinearDamping(v: number): void }
}

// -------------------------------------------------------------------
// PhysicsObject — wraps a single Planck body
// -------------------------------------------------------------------
export class PhysicsObject {
    public body: Planck.Body

    public get pos(): Vec2Like { return this.body.getPosition() }
    public set pos(p: Vec2Like) { this.body.setPosition(Planck.Vec2(p.x, p.y)) }
    public get angle(): number { return this.body.getAngle() }
    public set angle(a: number) { this.body.setAngle(a) }

    public get forward(): Vec2Like {
        const angle = this.body.getAngle()
        return { x: Math.sin(angle), y: -Math.cos(angle) }
    }

    constructor(private world: Planck.World, spec: EntitySpec) {
        const isDynamic = spec.physics.type === "dynamic"
        this.body = world.createBody({
            type: isDynamic ? "dynamic" : "static",
            position: Planck.Vec2(spec.pos.x, spec.pos.y),
            angle: toRadians(spec.angle),
            angularDamping: spec.physics.angularDamping,
            linearDamping: spec.physics.linearDamping,
            fixedRotation: spec.physics.fixedRotation ?? false,
        })
        for (const shapeSpec of spec.shapes) {
            this.addShape(shapeSpec)
        }
    }

    public addShape(shapeSpec: EntityShapeSpec): Planck.Fixture | null {
        const ph = shapeSpec.physics
        const fixtureDef = {
            density: ph.density,
            friction: ph.friction,
            restitution: ph.restitution,
            isSensor: ph.sensor,
            filterMaskBits: ph.maskBits,
            filterCategoryBits: ph.categoryBits,
            userData: shapeSpec,
        }

        const offset = shapeSpec.offset
        const angleRad = toRadians(shapeSpec.angle)

        switch (shapeSpec.type) {
            case "box": {
                const s = shapeSpec as EntityBoxShapeSpec
                const hw = s.size.x / 2
                const hh = s.size.y / 2
                const shape = Planck.Box(hw, hh, Planck.Vec2(offset.x, offset.y), angleRad)
                return this.body.createFixture(shape, fixtureDef)
            }
            case "circle": {
                const s = shapeSpec as EntityCircleShapeSpec
                const shape = Planck.Circle(Planck.Vec2(offset.x, offset.y), s.radius)
                return this.body.createFixture(shape, fixtureDef)
            }
            case "polygon": {
                const s = shapeSpec as EntityPolygonShapeSpec
                if (s.verts.length < 3) return null
                // Planck limits polygons to 8 verts — chunk if needed
                const verts = s.verts.slice(0, 8).map(v =>
                    Vec2.add(Vec2.rotate(v, angleRad), offset)
                )
                const shape = Planck.Polygon(verts.map(v => Planck.Vec2(v.x, v.y)))
                return this.body.createFixture(shape, fixtureDef)
            }
            case "edge": {
                const s = shapeSpec as EntityEdgeShapeSpec
                const v0 = Vec2.add(Vec2.rotate(s.v0, angleRad), offset)
                const v1 = Vec2.add(Vec2.rotate(s.v1, angleRad), offset)
                const shape = Planck.Edge(Planck.Vec2(v0.x, v0.y), Planck.Vec2(v1.x, v1.y))
                return this.body.createFixture(shape, fixtureDef)
            }
            case "path": {
                const s = shapeSpec as EntityPathShapeSpec
                const sampled = samplePath(s.verts, s.closed, s.stepSize)
                for (let i = 1; i < sampled.length; i++) {
                    const v0 = Vec2.add(Vec2.rotate(sampled[i - 1], angleRad), offset)
                    const v1 = Vec2.add(Vec2.rotate(sampled[i], angleRad), offset)
                    this.body.createFixture(
                        Planck.Edge(Planck.Vec2(v0.x, v0.y), Planck.Vec2(v1.x, v1.y)),
                        { ...fixtureDef, userData: shapeSpec }
                    )
                }
                if (s.closed && sampled.length > 1) {
                    const v0 = Vec2.add(Vec2.rotate(sampled[sampled.length - 1], angleRad), offset)
                    const v1 = Vec2.add(Vec2.rotate(sampled[0], angleRad), offset)
                    this.body.createFixture(
                        Planck.Edge(Planck.Vec2(v0.x, v0.y), Planck.Vec2(v1.x, v1.y)),
                        { ...fixtureDef, userData: shapeSpec }
                    )
                }
                return null
            }
        }
    }

    public addFrictionJoint(localPos: Vec2Like): FrictionJointHandle | undefined {
        const ground = this.world.createBody()
        const def = {
            bodyA: this.body,
            bodyB: ground,
            localAnchorA: Planck.Vec2(localPos.x, localPos.y),
            localAnchorB: Planck.Vec2(0, 0),
            maxForce: 5000,
            maxTorque: 2,
            collideConnected: false,
        }
        // planck types don't export FrictionJoint on the default namespace
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joint = this.world.createJoint(new (Planck as any).FrictionJoint(def))
        if (!joint) return undefined
        return joint as unknown as FrictionJointHandle
    }

    public getWorldPoint(localPos: Vec2Like): Vec2Like {
        const wp = this.body.getWorldPoint(Planck.Vec2(localPos.x, localPos.y))
        return { x: wp.x, y: wp.y }
    }

    public getLateralVelocity(worldPos: Vec2Like): Vec2Like {
        const vel = this.body.getLinearVelocityFromWorldPoint(Planck.Vec2(worldPos.x, worldPos.y))
        const right = Vec2.perp(this.forward, false)
        const lateralSpeed = Vec2.dot(right, vel)
        return Vec2.scale(right, lateralSpeed)
    }

    public getAngularVelocity(): number { return this.body.getAngularVelocity() }
    public setAngularVelocity(v: number): void { this.body.setAngularVelocity(v) }

    public applyForce(force: Vec2Like, worldPos: Vec2Like): void {
        this.body.applyForce(Planck.Vec2(force.x, force.y), Planck.Vec2(worldPos.x, worldPos.y))
    }

    public applyAngularForce(torque: number): void {
        this.body.applyAngularImpulse(torque * (1 / 60))
    }

    public destroy(): void {
        this.world.destroyBody(this.body)
    }

    public update(_dtSecs: number): void {}
}

// -------------------------------------------------------------------
// Physics — world wrapper
// -------------------------------------------------------------------
export default class Physics {
    private _world!: Planck.World
    private _mouseGround!: Planck.Body
    // planck types don't export MouseJoint on the default namespace
    // (same issue as FrictionJoint above)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _mouseJoint: any
    private _mouseCachedDamping?: { linear: number; angular: number }

    public get world() { return this._world }
    public get mouseJoint() { return this._mouseJoint }

    constructor() {
        this.createWorld()
    }

    private createWorld(): void {
        if (this._world) {
            try {
                for (let b = this._world.getBodyList(); b; b = b.getNext()) this._world.destroyBody(b)
            } catch {}
            try {
                for (let j = this._world.getJointList(); j; j = j.getNext()) this._world.destroyJoint(j)
            } catch {}
        }
        this._world = Planck.World({ gravity: Planck.Vec2(0, 0) })
        this._mouseGround = this._world.createBody()
        this._mouseJoint = undefined
    }

    public reinit(): void { this.createWorld() }

    public createObject(spec: EntitySpec): PhysicsObject {
        return new PhysicsObject(this._world, spec)
    }

    public update(dtSecs: number): void {
        this._world.step(dtSecs, 6, 2)
    }

    // -------------------------------------------------------------------
    // Mouse drag-and-drop (ported from microbit-robot/botsim physics.ts,
    // decision #6). Exactly one body can be grabbed at a time — there is no
    // multi-select/multi-drag concept.
    // -------------------------------------------------------------------

    private releaseMouseJoint(): void {
        if (this._mouseJoint) {
            if (this._mouseCachedDamping) {
                const bodyB = this._mouseJoint.getBodyB() as Planck.Body | undefined
                bodyB?.setLinearDamping(this._mouseCachedDamping.linear)
                bodyB?.setAngularDamping(this._mouseCachedDamping.angular)
                this._mouseCachedDamping = undefined
            }
            this._world.destroyJoint(this._mouseJoint)
            this._mouseJoint = undefined
        }
    }

    public mouseDown(p: Vec2Like): void {
        this.releaseMouseJoint()
        const body = this.findBody(p, fixt => {
            const spec = fixt.getUserData() as EntityShapeSpec | null
            return spec?.roles?.includes("mouse-target") ?? false
        })
        if (!body) return

        this._mouseCachedDamping = {
            linear: body.getLinearDamping(),
            angular: body.getAngularDamping(),
        }
        body.setLinearDamping(body.getLinearDamping() / 3)
        body.setAngularDamping((body.getAngularDamping() * 2) / 3)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joint = new (Planck as any).MouseJoint({
            target: Planck.Vec2(p.x, p.y),
            maxForce: 100000,
            bodyA: this._mouseGround,
            bodyB: body,
        })
        this._mouseJoint = this._world.createJoint(joint)
    }

    public mouseMove(p: Vec2Like): void {
        this._mouseJoint?.setTarget(Planck.Vec2(p.x, p.y))
    }

    public mouseUp(_p: Vec2Like): void {
        this.releaseMouseJoint()
    }

    public isMouseTarget(p: Vec2Like): boolean {
        return !!this.findBody(p, fixt => {
            const spec = fixt.getUserData() as EntityShapeSpec | null
            return spec?.roles?.includes("mouse-target") ?? false
        })
    }

    private findBody(p: Vec2Like, filterFn: (fixture: Planck.Fixture) => boolean): Planck.Body | undefined {
        let body: Planck.Body | undefined
        const aabb = Planck.AABB(Planck.Vec2(p.x, p.y), Planck.Vec2(p.x, p.y))
        this._world.queryAABB(aabb, fixture => {
            if (!fixture.getBody().isDynamic()) return true
            if (!fixture.testPoint(Planck.Vec2(p.x, p.y))) return true
            if (!filterFn(fixture)) return true
            body = fixture.getBody()
            return false
        })
        return body
    }
}

