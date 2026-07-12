import { describe, it, expect } from "vitest"
import {
    addShaderProgram, getShaderProgram, inferUniformType, buildUniformGroup,
    registerTimedShader, advanceShaderTime, BasicVertexShader, CommonFragmentShaderGlobals,
} from "./shaderRegistry"

describe("addShaderProgram / getShaderProgram", () => {
    it("returns the registered program for a known name", () => {
        addShaderProgram(
            "test_known_shader",
            BasicVertexShader,
            CommonFragmentShaderGlobals + "void main() { gl_FragColor = vec4(1.0); }"
        )

        const pgm = getShaderProgram("test_known_shader")

        expect(pgm).toBeDefined()
    })

    it("caches the built program across repeated lookups (same instance)", () => {
        addShaderProgram(
            "test_cached_shader",
            BasicVertexShader,
            CommonFragmentShaderGlobals + "void main() { gl_FragColor = vec4(1.0); }"
        )

        const first = getShaderProgram("test_cached_shader")
        const second = getShaderProgram("test_cached_shader")

        expect(first).toBe(second)
    })

    it("falls back to the $$missing_shader$$ program for an unregistered name", () => {
        const missing = getShaderProgram("$$missing_shader$$")

        const fallback = getShaderProgram("test_never_registered_shader_name")

        expect(fallback).toBe(missing)
    })
})

describe("inferUniformType", () => {
    it("infers f32 for a plain number", () => {
        expect(inferUniformType(1)).toBe("f32")
    })

    it("infers vec2<f32> for a 2-length array", () => {
        expect(inferUniformType([1, 2])).toBe("vec2<f32>")
    })

    it("infers vec3<f32> for a 3-length array", () => {
        expect(inferUniformType([1, 2, 3])).toBe("vec3<f32>")
    })

    it("infers vec4<f32> for a 4-length array", () => {
        expect(inferUniformType([1, 2, 3, 4])).toBe("vec4<f32>")
    })

    it("throws for an unsupported vector length", () => {
        expect(() => inferUniformType([1, 2, 3, 4, 5])).toThrow(/unsupported uniform vector length/)
    })

    it("throws for an empty array", () => {
        expect(() => inferUniformType([])).toThrow(/unsupported uniform vector length/)
    })
})

describe("buildUniformGroup", () => {
    it("builds a UniformGroup with an inferred type per value", () => {
        const group = buildUniformGroup({ uAlpha: 0.5, uBrushColor: [1, 0, 0] })

        expect(group.uniforms.uAlpha).toBe(0.5)
        expect(group.uniforms.uBrushColor).toEqual([1, 0, 0])
    })
})

describe("registerTimedShader / advanceShaderTime", () => {
    it("advances the uTime uniform for every registered mesh on each tick", () => {
        const group = buildUniformGroup({ uTime: 0 })
        const fakeMesh = { once: () => undefined } as unknown as Parameters<typeof registerTimedShader>[0]

        registerTimedShader(fakeMesh, group)
        advanceShaderTime(0.5)
        advanceShaderTime(0.25)

        expect(group.uniforms.uTime).toBeCloseTo(0.75)
    })
})
