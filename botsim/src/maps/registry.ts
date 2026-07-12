import { MapSpec } from "./mapSpec"
import { DEFAULT_MAP } from "./defaultMap"
import { TABLE_MAP } from "./tableMap"
import { LIGHT_MAP } from "./lightMap"

// Numeric id -> MapSpec registry. Ids are an append-only wire contract that
// must stay in sync with the extension's `SimMap` enum values.
export const MAP_REGISTRY: Record<number, MapSpec> = {
    [DEFAULT_MAP.id]: DEFAULT_MAP,
    [TABLE_MAP.id]: TABLE_MAP,
    [LIGHT_MAP.id]: LIGHT_MAP,
}

// Resolves a mapselect wire id to its MapSpec. Unknown ids return undefined —
// there is no fallback to DEFAULT_MAP, since an unresolved id likely signals
// an enum/registry mismatch rather than a valid "use the default" request.
export function resolveMap(id: number): MapSpec | undefined {
    return MAP_REGISTRY[id]
}
