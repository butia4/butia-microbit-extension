import { Vec2Like } from "./types/vec2"
import { toRadians } from "./util"

export function appoximateArc(center: Vec2Like, radius: number, startDeg: number, endDeg: number, segments: number): Vec2Like[] {
    const result: Vec2Like[] = []
    const startRad = toRadians(startDeg)
    const endRad = toRadians(endDeg)
    for (let i = 0; i <= segments; i++) {
        const angle = startRad + (endRad - startRad) * (i / segments)
        result.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius })
    }
    return result
}
