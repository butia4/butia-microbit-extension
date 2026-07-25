import { z } from "zod"

// Per-map localStorage key builders (see map-scoped-settings design:
// "Per-Map localStorage Keying").
export function pinAssignmentKey(mapId: number): string {
    return `butia-sim:pinAssignment:${mapId}`
}

export function sensorSettingsKey(mapId: number): string {
    return `butia-sim:sensorSettings:${mapId}`
}

/**
 * Reads a map-scoped localStorage slot and validates it against `schema`.
 * Falls back to `fallback` (returned by reference) whenever the key is
 * missing, localStorage is inaccessible, the JSON is malformed, or the
 * parsed value fails schema validation.
 */
export function loadOrDefaultMapSlot<T>(
    mapId: number,
    keyFn: (mapId: number) => string,
    schema: z.ZodType<T>,
    fallback: T,
): T {
    try {
        const raw = localStorage.getItem(keyFn(mapId))
        if (raw) {
            const result = schema.safeParse(JSON.parse(raw))
            if (result.success) return result.data
        }
    } catch {
        // malformed/inaccessible localStorage — fall back to default
    }
    return fallback
}

/** Persists a map-scoped value to its localStorage slot. Best-effort. */
export function persistMapSlot<T>(mapId: number, keyFn: (mapId: number) => string, value: T): void {
    try {
        localStorage.setItem(keyFn(mapId), JSON.stringify(value))
    } catch {
        // no-op — persistence is best-effort
    }
}
