export const DRAW_DIRECTIVE_ID = Symbol("__DRAW_DIRECTIVE_ID")
export const DUPLICATE_ALLOWED = Symbol("__DUPLICATE_ALLOWED")

export const CollisionStrategy = {
    APPEND: "APPEND",
    REPLACE: "REPLACE",
} as const

export type CollisionStrategy = (typeof CollisionStrategy)[keyof typeof CollisionStrategy]

export type DrawDirective = XRFrameRequestCallback & {
    [DRAW_DIRECTIVE_ID]: {
        identifier: string
    } & Required<DrawDirectiveOptions>
}

export type DrawDirectiveOptions = Partial<{
    onCollision: CollisionStrategy
}>

const createDrawDirective = (
    identifier: string,
    call: XRFrameRequestCallback,
    options?: DrawDirectiveOptions,
): DrawDirective => {
    ;(call as DrawDirective)[DRAW_DIRECTIVE_ID] = {
        identifier,
        onCollision: options?.onCollision ?? CollisionStrategy.APPEND,
    }
    return call as DrawDirective
}

export default createDrawDirective
