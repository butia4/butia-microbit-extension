import { toDegrees, toRadians } from "../util"

export interface Vec2Like {
    x: number
    y: number
}

export class Vec2 implements Vec2Like {
    public x = 0
    public y = 0

    public static like(x: number, y: number): Vec2Like { return { x, y } }
    public static copy(v: Vec2Like): Vec2Like { return { ...v } }
    public static areEqual(a: Vec2Like, b: Vec2Like): boolean { return a.x === b.x && a.y === b.y }
    public static add(a: Vec2Like, b: Vec2Like): Vec2Like { return { x: a.x + b.x, y: a.y + b.y } }
    public static sub(a: Vec2Like, b: Vec2Like): Vec2Like { return { x: a.x - b.x, y: a.y - b.y } }
    public static mul(a: Vec2Like, b: Vec2Like): Vec2Like { return { x: a.x * b.x, y: a.y * b.y } }
    public static div(a: Vec2Like, b: Vec2Like): Vec2Like { return { x: a.x / b.x, y: a.y / b.y } }
    public static neg(v: Vec2Like): Vec2Like { return { x: -v.x, y: -v.y } }
    public static scale(v: Vec2Like, n: number): Vec2Like { return { x: v.x * n, y: v.y * n } }
    public static len(v: Vec2Like): number { return Math.sqrt(v.x * v.x + v.y * v.y) }
    public static lenSq(v: Vec2Like): number { return v.x * v.x + v.y * v.y }
    public static dot(a: Vec2Like, b: Vec2Like): number { return a.x * b.x + a.y * b.y }
    public static cross(a: Vec2Like, b: Vec2Like): number { return a.x * b.y - a.y * b.x }

    public static normalize(v: Vec2Like, fallback?: Vec2Like): Vec2Like {
        const len = Vec2.len(v)
        if (len === 0) {
            if (fallback) return Vec2.copy(fallback)
            throw new Error("Cannot normalize zero vector")
        }
        return { x: v.x / len, y: v.y / len }
    }

    public static perp(v: Vec2Like, up: boolean): Vec2Like {
        return up ? { x: -v.y, y: v.x } : { x: v.y, y: -v.x }
    }

    public static dist(a: Vec2Like, b: Vec2Like): number { return Vec2.len(Vec2.sub(a, b)) }
    public static distSq(a: Vec2Like, b: Vec2Like): number { return Vec2.lenSq(Vec2.sub(a, b)) }
    public static transpose(v: Vec2Like): Vec2Like { return { x: v.y, y: v.x } }
    public static abs(v: Vec2Like): Vec2Like { return { x: Math.abs(v.x), y: Math.abs(v.y) } }

    public static angle(v: Vec2Like): number { return Math.atan2(v.y, v.x) }
    public static angleDeg(v: Vec2Like): number { return toDegrees(Vec2.angle(v)) }
    public static fromAngle(angle: number): Vec2Like { return { x: Math.cos(angle), y: Math.sin(angle) } }
    public static fromAngleDeg(angle: number): Vec2Like { return Vec2.fromAngle(toRadians(angle)) }

    public static rotate(v: Vec2Like, angle: number): Vec2Like {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        return { x: v.x * c - v.y * s, y: v.y * c + v.x * s }
    }
    public static rotateDeg(v: Vec2Like, angle: number): Vec2Like {
        return Vec2.rotate(v, toRadians(angle))
    }

    public static transform(v: Vec2Like, p: Vec2Like, angle: number): Vec2Like {
        return Vec2.add(Vec2.rotate(v, angle), p)
    }
    public static transformDeg(v: Vec2Like, p: Vec2Like, angle: number): Vec2Like {
        return Vec2.add(Vec2.rotateDeg(v, angle), p)
    }
    public static untransform(v: Vec2Like, p: Vec2Like, angle: number): Vec2Like {
        return Vec2.rotate(Vec2.sub(v, p), -angle)
    }
    public static untransformDeg(v: Vec2Like, p: Vec2Like, angle: number): Vec2Like {
        return Vec2.rotateDeg(Vec2.sub(v, p), -angle)
    }

    public static zero(): Vec2Like { return { x: 0, y: 0 } }
    public static one(): Vec2Like { return { x: 1, y: 1 } }
    public static up(): Vec2Like { return { x: 0, y: -1 } }
    public static down(): Vec2Like { return { x: 0, y: 1 } }
    public static left(): Vec2Like { return { x: -1, y: 0 } }
    public static right(): Vec2Like { return { x: 1, y: 0 } }

    public static lerp(a: Vec2Like, b: Vec2Like, t: number): Vec2Like {
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }

    public static clamp(v: Vec2Like, min: Vec2Like, max: Vec2Like): Vec2Like {
        return {
            x: Math.min(Math.max(v.x, min.x), max.x),
            y: Math.min(Math.max(v.y, min.y), max.y),
        }
    }
}
