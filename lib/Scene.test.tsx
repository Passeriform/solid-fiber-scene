import { render } from "@solidjs/testing-library"
import type { ComponentProps } from "solid-js"
import { AmbientLight, DirectionalLight, Object3D, PerspectiveCamera, Vector3 } from "three"
import { describe, expect, it, vi } from "vitest"
import SceneProvider, { useScene } from "./Scene"

const renderComponentUnderScene = (props: ComponentProps<typeof SceneProvider> = {}) => {
    let context: ReturnType<typeof useScene> | undefined
    const TestComponent = () => {
        context = useScene()
        return null
    }
    render(() => (
        <SceneProvider {...props}>
            <TestComponent />
        </SceneProvider>
    ))
    if (!context) throw new Error("Context not found")
    return context
}

describe("SceneProvider context", () => {
    it("should provide a PerspectiveCamera instance as camera", () => {
        const { camera } = renderComponentUnderScene()
        expect(camera).toBeInstanceOf(PerspectiveCamera)
    })

    it("should add the Object3D instance to the scene", () => {
        const { addToScene, scene } = renderComponentUnderScene()
        const obj = new Object3D()
        addToScene(obj)
        expect(scene.children).toContain(obj)
    })

    it("should set ambientLightColor and directionalLightPosition", () => {
        const color = 0x123456
        const position = new Vector3(2, 3, 4)
        const { scene } = renderComponentUnderScene({ ambientLightColor: color, directionalLightPosition: position })
        const ambientLight = scene.children.find((obj) => obj instanceof AmbientLight)
        const directionalLight = scene.children.find((obj) => obj instanceof DirectionalLight)
        expect(ambientLight).toBeDefined()
        expect(directionalLight).toBeDefined()
        expect(ambientLight?.color.getHex()).toBe(color)
        expect(directionalLight?.position.equals(position)).toBe(true)
    })

    describe("drawDirective callback execution under different collision strategies", () => {
        it.each([
            ["not provided (default)", undefined],
            ["APPEND", "APPEND" as const],
            ["REPLACE", "REPLACE" as const],
        ])("should execute single callback when onCollision is %s", (_, onCollision) => {
            const call = vi.fn()
            const { addDrawDirective } = renderComponentUnderScene()
            addDrawDirective("id", call, onCollision ? { onCollision } : undefined)
            vi.advanceTimersByTime(1)
            expect(call).toHaveBeenCalled()
        })

        it("should append directive in the list when onCollision is APPEND", () => {
            const { addDrawDirective } = renderComponentUnderScene()
            const call1 = vi.fn()
            const call2 = vi.fn()
            addDrawDirective("id", call1, { onCollision: "APPEND" })
            addDrawDirective("id", call2, { onCollision: "APPEND" })
            vi.advanceTimersByTime(1)
            expect(call1).toHaveBeenCalled()
            expect(call2).toHaveBeenCalled()
        })

        it("should replace directive in the list when onCollision is REPLACE", () => {
            const { addDrawDirective } = renderComponentUnderScene()
            const call1 = vi.fn()
            const call2 = vi.fn()
            addDrawDirective("id", call1, { onCollision: "REPLACE" })
            addDrawDirective("id", call2, { onCollision: "REPLACE" })
            vi.advanceTimersByTime(1)
            expect(call1).not.toHaveBeenCalled()
            expect(call2).toHaveBeenCalled()
        })
    })
})
