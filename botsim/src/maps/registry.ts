import { MapSpec } from "./mapSpec"
import { LINE_A_TO_B_MAP } from "./lineAToBMap"
import { CIRCLE_ARENA_MAP } from "./circleArenaMap"

// Ids must stay in sync with the extension's ButiaSimMap enum
// (../../../src/types/enums.d.ts): LineAToB = 4, CircleArena = 5.
// defaultMap/tableMap/lightMap (ids 1-3) are kept as files but unregistered.
export const MAP_REGISTRY: Record<number, MapSpec> = {
    [LINE_A_TO_B_MAP.id]: LINE_A_TO_B_MAP,
    [CIRCLE_ARENA_MAP.id]: CIRCLE_ARENA_MAP,
}

export function resolveMap(id: number): MapSpec | undefined {
    return MAP_REGISTRY[id]
}
