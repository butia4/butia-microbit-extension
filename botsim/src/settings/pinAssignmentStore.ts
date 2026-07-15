import { ConnectorSlot } from "../botSpecs/botSpec"

// Persists which micro:bit connector (J1-J5) feeds each frontal sensor mount
// (left/right), so the user's choice on the settings screen survives a page
// reload. Read once at "mapselect" time (see App.tsx) — never mid-run, per
// the design decision that live reassignment is out of scope for v1.

const STORAGE_KEY = "butia-sim:pinAssignment"

const VALID_SLOTS: ConnectorSlot[] = ["J1", "J2", "J3", "J4", "J5"]

export type PinAssignment = {
    left: ConnectorSlot
    right: ConnectorSlot
}

// Sensible default when nothing has ever been persisted — localStorage is
// the sole source of truth for the port assignment (no wire-message fallback
// exists anymore; see amendment removing leftPort/rightPort from mapselect).
export const DEFAULT_PIN_ASSIGNMENT: PinAssignment = { left: "J1", right: "J2" }

function isConnectorSlot(value: unknown): value is ConnectorSlot {
    return typeof value === "string" && (VALID_SLOTS as string[]).includes(value)
}

function isValidShape(value: unknown): value is PinAssignment {
    if (!value || typeof value !== "object") return false
    const candidate = value as Record<string, unknown>
    return isConnectorSlot(candidate.left) && isConnectorSlot(candidate.right)
}

// Returns the persisted assignment, or null when absent, malformed, or
// carrying a duplicate left/right port (never throws).
export function getPinAssignment(): PinAssignment | null {
    let raw: string | null
    try {
        raw = localStorage.getItem(STORAGE_KEY)
    } catch {
        return null
    }
    if (!raw) return null

    let parsed: unknown
    try {
        parsed = JSON.parse(raw)
    } catch {
        return null
    }

    if (!isValidShape(parsed)) return null
    if (parsed.left === parsed.right) return null

    return { left: parsed.left, right: parsed.right }
}

// Validates and persists a new assignment. Rejects (without throwing or
// writing) when the same port is assigned to both mounts.
export function setPinAssignment(assignment: PinAssignment): { ok: true } | { ok: false; error: string } {
    if (assignment.left === assignment.right) {
        return { ok: false, error: "No se puede asignar el mismo conector a ambos montajes." }
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assignment))
    } catch {
        return { ok: false, error: "No se pudo guardar la configuración." }
    }

    return { ok: true }
}

export function clearPinAssignment(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // no-op — nothing persisted to begin with
    }
}
