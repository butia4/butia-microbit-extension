import { z } from "zod"

/** Fixed TTL for session-scoped storage entries: 8 hours, in milliseconds. */
export const SESSION_STORAGE_TTL_MS = 8 * 60 * 60 * 1000

/**
 * Generic TTL-aware `sessionStorage` envelope utility, independent of any
 * particular business shape. Wraps stored values as `{ value, savedAt }` and
 * treats an entry as expired once `Date.now() - savedAt >= ttlMs`.
 *
 * Never throws: any missing key, inaccessible storage, malformed JSON, or
 * envelope/business schema validation failure (including a missing/invalid
 * `savedAt`) resolves to `undefined`.
 */
export function loadWithTtl<T>(key: string, schema: z.ZodType<T>, ttlMs: number = SESSION_STORAGE_TTL_MS): T | undefined {
    try {
        const raw = sessionStorage.getItem(key)
        if (!raw) return undefined

        const envelopeSchema = z.object({ value: schema, savedAt: z.number() })
        const result = envelopeSchema.safeParse(JSON.parse(raw))
        if (!result.success) return undefined

        const expired = Date.now() - result.data.savedAt >= ttlMs
        if (expired) return undefined

        return result.data.value
    } catch {
        // malformed/inaccessible sessionStorage — treat as no value
        return undefined
    }
}

/** Persists a value to `sessionStorage`, wrapped with the current timestamp. Best-effort. */
export function saveWithTtl<T>(key: string, value: T): void {
    try {
        sessionStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }))
    } catch {
        // no-op — persistence is best-effort
    }
}
