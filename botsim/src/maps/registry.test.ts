import { describe, it, expect } from "vitest"
import { resolveMap } from "./registry"
import { DEFAULT_MAP } from "./defaultMap"
import { TABLE_MAP } from "./tableMap"

describe("resolveMap", () => {
    it("returns DEFAULT_MAP for id 1, unaffected by the new table map", () => {
        expect(resolveMap(1)).toBe(DEFAULT_MAP)
        expect(resolveMap(1)?.sensorModes).toBeUndefined()
    })

    it("returns TABLE_MAP for id 2 with the expected id/sensorModes shape", () => {
        const map = resolveMap(2)
        expect(map).toBe(TABLE_MAP)
        expect(map?.id).toBe(2)
        expect(map?.sensorModes).toEqual({ J1: "surface", J2: "surface" })
    })

    it("returns undefined for an unregistered id", () => {
        expect(resolveMap(999)).toBeUndefined()
    })
})
