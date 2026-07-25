import { z } from "zod"
import { loadWithTtl, saveWithTtl } from "../shared/sessionStorageWithTtl"

// Per-map sessionStorage key builders (see map-scoped-settings design:
// "Per-Map localStorage Keying").
export function pinAssignmentKey(mapId: number): string {
    return `butia-sim:pinAssignment:${mapId}`
}

export function sensorSettingsKey(mapId: number): string {
    return `butia-sim:sensorSettings:${mapId}`
}

/**
 * Reads a map-scoped sessionStorage slot and validates it against `schema`.
 * Falls back to `fallback` (returned by reference) whenever the key is
 * missing, sessionStorage is inaccessible, the entry has expired past its
 * TTL, the JSON is malformed, or the parsed value fails schema validation.
 */
export function loadOrDefaultMapSlot<T>(
    mapId: number,
    keyFn: (mapId: number) => string,
    schema: z.ZodType<T>,
    fallback: T,
): T {
    return loadWithTtl(keyFn(mapId), schema) ?? fallback
}

/** Persists a map-scoped value to its sessionStorage slot. Best-effort. */
export function persistMapSlot<T>(mapId: number, keyFn: (mapId: number) => string, value: T): void {
    saveWithTtl(keyFn(mapId), value)
}
