import { MapSpec } from "./mapSpec"
import { DEFAULT_MAP } from "./defaultMap"
import { TABLE_MAP } from "./tableMap"
import { LIGHT_MAP } from "./lightMap"

// ids must stay in sync with the extension's SimMap enum
export const MAP_REGISTRY: Record<number, MapSpec> = {
    [DEFAULT_MAP.id]: DEFAULT_MAP,
    [TABLE_MAP.id]: TABLE_MAP,
    [LIGHT_MAP.id]: LIGHT_MAP,
}

export function resolveMap(id: number): MapSpec | undefined {
    return MAP_REGISTRY[id]
}
