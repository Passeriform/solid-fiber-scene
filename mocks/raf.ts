import { vi } from "vitest"

const fps = 1

self = window

vi.useFakeTimers()

self.requestAnimationFrame = (cb: XRFrameRequestCallback): number => {
    return setTimeout(() => cb(fps, {} as XRFrame), fps) as unknown as number
}

self.cancelAnimationFrame = vi.fn()
