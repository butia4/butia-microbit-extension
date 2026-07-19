import { ALL_MOUNT_SIDES, MountSide } from "../botSpecs/botSpec"

// Persists per-mount sensor configuration (mode, forward-only angle/
// direction) so the user's choice on the settings screen survives a page
// reload. Read once at "mapselect"/spawn time (see App.tsx/sim/index.ts) —
// never mid-run, per the design decision that live reassignment is out of
// scope for v1. This is a sibling of pinAssignmentStore.ts, not an extension
// of it: wiring (which J-port feeds which mount) and physical sensor
// configuration (mode/angle/direction) are separate concerns with
// separate validation rules.

const STORAGE_KEY = "butia-sim:sensorSettings"

const VALID_MODES: SensorMode[] = ["forward", "surface"]
const VALID_SIDES: readonly MountSide[] = ALL_MOUNT_SIDES

export type SensorMode = "forward" | "surface"

export type SensorMountSetting = {
    mode: SensorMode
    angle?: number      // degrees, forward-only; falls back to DEFAULT_LIGHT_ANGLE/DEFAULT_RANGE_ANGLE per sensor
    direction?: number  // degrees offset added to mount.facingDeg, forward-only
}

// A mount absent from this map is "unconfigured" — that resolves to
// `mode: "surface"` at Bot construction time (see spec's "Default mode for
// unconfigured mounts" requirement). The store itself does not materialize
// per-mount defaults.
export type SensorSettings = Partial<Record<MountSide, SensorMountSetting>>

export const DEFAULT_SENSOR_SETTINGS: SensorSettings = {}

function isSensorMode(value: unknown): value is SensorMode {
    return typeof value === "string" && (VALID_MODES as string[]).includes(value)
}

function isValidMountSetting(value: unknown): value is SensorMountSetting {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false
    const candidate = value as Record<string, unknown>
    if (!isSensorMode(candidate.mode)) return false
    if (candidate.angle !== undefined && typeof candidate.angle !== "number") return false
    if (candidate.direction !== undefined && typeof candidate.direction !== "number") return false
    return true
}

// Breaking reset: rejects any shape carrying unknown MountSide keys or a
// malformed per-mount setting — no migration path, treated as absent/invalid
// on load per spec.
function isValidShape(value: unknown): value is SensorSettings {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false
    const candidate = value as Record<string, unknown>
    for (const key of Object.keys(candidate)) {
        if (!(VALID_SIDES as string[]).includes(key)) return false
        const setting = candidate[key]
        if (setting !== undefined && !isValidMountSetting(setting)) return false
    }
    return true
}

// Returns the persisted settings, or null when absent, malformed, or carrying
// an unknown mount key / invalid per-mount setting (never throws).
export function getSensorSettings(): SensorSettings | null {
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

// Validates and persists new sensor settings. `{}` (all-unconfigured, i.e.
// every mount defaults to "surface") is a valid save.
export function setSensorSettings(settings: SensorSettings): { ok: true } | { ok: false; error: string } {
    if (!isValidShape(settings)) {
        return { ok: false, error: "La configuración de sensores no es válida." }
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
        return { ok: false, error: "No se pudo guardar la configuración de sensores." }
    }

    return { ok: true }
}

export function clearSensorSettings(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // no-op — nothing persisted to begin with
    }
}
