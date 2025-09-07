import { beforeEach, describe, expect, it, vi } from "vitest"
import createDrawDirective, { DRAW_DIRECTIVE_ID } from "./drawDirective"

describe("createDrawDirective", () => {
    const cb = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should call the original callback with correct arguments when invoked", () => {
        const directive = createDrawDirective("test-id", cb)
        directive(123, {} as XRFrame)
        expect(cb).toHaveBeenCalledWith(123, {})
    })

    it("should set collision strategy to default (APPEND) if not provided", () => {
        const cb = vi.fn()
        const directive = createDrawDirective("test-id", cb)
        expect((directive as any)[DRAW_DIRECTIVE_ID].onCollision).toBe("APPEND")
    })

    it("should set collision strategy to custom value if provided", () => {
        const cb = vi.fn()
        const directive = createDrawDirective("test-id", cb, { onCollision: "REPLACE" })
        expect((directive as any)[DRAW_DIRECTIVE_ID].onCollision).toBe("REPLACE")
    })
})
