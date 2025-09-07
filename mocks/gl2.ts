import { vi } from "vitest"

class MockWebGL2RenderingContext {}
window.WebGL2RenderingContext = MockWebGL2RenderingContext as any

const originalGetContext = HTMLCanvasElement.prototype.getContext
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement,
    type: string,
    ...args: any[]
) {
    if (type === "webgl2") {
        return {
            bindTexture: vi.fn(),
            clear: vi.fn(),
            clearColor: vi.fn(),
            clearDepth: vi.fn(),
            clearStencil: vi.fn(),
            colorMask: vi.fn(),
            createTexture: vi.fn().mockReturnValue({}),
            createFramebuffer: vi.fn().mockReturnValue({}),
            cullFace: vi.fn(),
            depthFunc: vi.fn(),
            depthMask: vi.fn(),
            disable: vi.fn(),
            enable: vi.fn(),
            frontFace: vi.fn(),
            getContextAttributes: vi.fn().mockReturnValue({}),
            getExtension: vi.fn().mockImplementation((pname: string) => {
                switch (pname) {
                    case "WEBGL_lose_context":
                        return { loseContext: vi.fn() }
                    default:
                        return
                }
            }),
            getParameter: vi.fn().mockImplementation((pname: number) => {
                switch (pname) {
                    case 0x1f02: // gl.VERSION
                        return "WebGL 2.0 Mock"
                    case 0x8b8c: // gl.SHADING_LANGUAGE_VERSION
                        return "WebGL GLSL ES 3.00"
                    case 0x0d33: // gl.MAX_TEXTURE_SIZE
                        return 1024
                    case 0x8869: // gl.MAX_VERTEX_ATTRIBS
                        return 16
                    case 0x84e2: // gl.MAX_TEXTURE_IMAGE_UNITS
                        return 8
                    case 0x8872: // gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
                        return 16
                    default:
                        return 0
                }
            }),
            getShaderPrecisionFormat: vi.fn().mockReturnValue({ precision: 23, rangeMin: 127, rangeMax: 127 }),
            stencilMask: vi.fn(),
            texParameteri: vi.fn(),
            texImage3D: vi.fn(),
            viewport: vi.fn(),
            VERSION: 0x1f02,
            MAX_TEXTURE_SIZE: 0x0d33,
            MAX_VERTEX_ATTRIBS: 0x8869,
        } as unknown as RenderingContext
    }
    return originalGetContext.call(this, type, ...args)
})
