import { ALL_MOUNT_SIDES, ConnectorSlot, MountSide } from "../botSpecs/botSpec"

// Persists which micro:bit connector (J1-J5), if any, feeds each of the 6
// physical sensor mounts, so the user's choice on the settings screen
// survives a page reload. Read once at "mapselect" time (see App.tsx) —
// never mid-run, per the design decision that live reassignment is out of
// scope for v1.

const STORAGE_KEY = "butia-sim:pinAssignment"

const VALID_SLOTS: ConnectorSlot[] = ["J1", "J2", "J3", "J4", "J5"]
const VALID_SIDES: readonly MountSide[] = ALL_MOUNT_SIDES

// A mount absent from this map (or explicitly `undefined`) is "no
// configurado" — that is a first-class, expected wiring state, not an
// error. Only mounts present with a defined ConnectorSlot are wired.
export type PinAssignment = Partial<Record<MountSide, ConnectorSlot>>

// All-unconfigured is the correct "fresh install" default now that
// unconfigured is a first-class state.
export const DEFAULT_PIN_ASSIGNMENT: PinAssignment = {}

function isConnectorSlot(value: unknown): value is ConnectorSlot {
    return typeof value === "string" && (VALID_SLOTS as string[]).includes(value)
}

// Shared by both the save path (setPinAssignment) and the load path
// (isValidShape) so "two configured mounts share a connector" can never be
// persisted OR accepted as valid on read — e.g. via a hand-edited localStorage
// value bypassing setPinAssignment entirely. Unconfigured (undefined) mounts
// are exempt, never counted as a conflict.
function hasDuplicateConnector(assignment: PinAssignment): boolean {
    const configuredSlots = Object.values(assignment).filter((slot): slot is ConnectorSlot => slot !== undefined)
    return new Set(configuredSlots).size !== configuredSlots.length
}

// Breaking reset: this MUST reject the legacy `{ left, right }` shape (its
// keys aren't in VALID_SIDES) — no migration path, treated as absent/invalid
// on load per spec.
function isValidShape(value: unknown): value is PinAssignment {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false
    const candidate = value as Record<string, unknown>
    for (const key of Object.keys(candidate)) {
        if (!(VALID_SIDES as string[]).includes(key)) return false
        const slot = candidate[key]
        if (slot !== undefined && !isConnectorSlot(slot)) return false
    }
    return !hasDuplicateConnector(candidate as PinAssignment)
}

// Returns the persisted assignment, or null when absent, malformed, shaped
// like the legacy `{ left, right }` model, or carrying a duplicate connector
// across configured mounts (never throws).
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

    return { ...parsed }
}

// Validates and persists a new assignment. Rejects (without throwing or
// writing) only when two or more *configured* (defined) mounts share the
// same connector — unconfigured mounts are exempt and never counted as a
// conflict. `{}` (all-unconfigured) is a valid save.
export function setPinAssignment(assignment: PinAssignment): { ok: true } | { ok: false; error: string } {
    if (hasDuplicateConnector(assignment)) {
        return { ok: false, error: "No se puede asignar el mismo conector a más de un montaje." }
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
