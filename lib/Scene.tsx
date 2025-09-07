import {
    type ParentComponent,
    createContext,
    createEffect,
    createSignal,
    mergeProps,
    onCleanup,
    onMount,
    useContext,
} from "solid-js"
import {
    AmbientLight,
    Color,
    DirectionalLight,
    type Object3D,
    PerspectiveCamera,
    Scene,
    type Vector3Like,
    WebGLRenderer,
} from "three"
import { getWebGL2ErrorMessage, isWebGL2Available } from "three-stdlib"
import createDrawDirective, {
    CollisionStrategy,
    DRAW_DIRECTIVE_ID,
    type DrawDirective,
    type DrawDirectiveOptions,
} from "./drawDirective"

type SceneContextValue = {
    scene: Scene
    camera: PerspectiveCamera
    addToScene: (object: Object3D) => void
    addDrawDirective: (identifier: string, directive: XRFrameRequestCallback, options?: DrawDirectiveOptions) => void
}

const SceneContext = createContext<SceneContextValue>()

type SceneProviderProps = {
    onWebGLError?: (div: HTMLDivElement) => void
    ambientLightColor?: number
    directionalLightPosition?: Vector3Like
}

const SceneProvider: ParentComponent<SceneProviderProps> = (_props) => {
    const props = mergeProps({ ambientLightColor: 0xffffff, directionalLightPosition: { x: 1, y: 1, z: 1 } }, _props)

    const scene = new Scene()
    const renderer = new WebGLRenderer({ antialias: true, alpha: true })
    const ambientLight = new AmbientLight()
    const directionalLight = new DirectionalLight(0xffffff, 2)
    const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000)

    const [drawDirectives, setDrawDirectives] = createSignal<DrawDirective[]>([])

    const addDrawDirective = (identifier: string, call: XRFrameRequestCallback, options?: DrawDirectiveOptions) => {
        const newDirective = createDrawDirective(identifier, call, options)
        if (options?.onCollision === CollisionStrategy.REPLACE) {
            const found = drawDirectives().findIndex((current) => current[DRAW_DIRECTIVE_ID].identifier === identifier)
            if (found === -1) {
                setDrawDirectives(drawDirectives().concat(newDirective))
            } else {
                setDrawDirectives(drawDirectives().with(found, newDirective))
            }
        } else {
            setDrawDirectives(drawDirectives().concat(newDirective))
        }
    }

    const addToScene = (object: Object3D) => {
        scene.add(object)
        renderer.render(scene, camera)
    }

    const updateWindowSize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const sceneMount = () => {
        renderer.setPixelRatio(window.devicePixelRatio)
        updateWindowSize()
    }

    const lightingMount = () => {
        addToScene(ambientLight)
        addToScene(directionalLight)
    }

    const sceneDispose = () => {
        renderer.dispose()
        scene.clear()
    }

    const lightingDispose = () => {
        ambientLight.dispose()
        directionalLight.dispose()
    }

    const draw = (time: number, frame: XRFrame) => {
        drawDirectives().forEach((directive) => {
            directive(time, frame)
        })
    }

    createEffect(() => {
        ambientLight.color = new Color(props.ambientLightColor)
        ambientLight.intensity = 2
    })

    createEffect(() => {
        directionalLight.color = new Color(0xffffff)
        directionalLight.intensity = 2
        directionalLight.position.copy(props.directionalLightPosition)
    })

    onMount(() => {
        if (!isWebGL2Available()) {
            props.onWebGLError?.(getWebGL2ErrorMessage())
            return
        }

        sceneMount()
        lightingMount()

        addDrawDirective(
            "renderer",
            () => {
                renderer.render(scene, camera)
            },
            { onCollision: CollisionStrategy.REPLACE },
        )

        renderer.setAnimationLoop(draw)

        window.addEventListener("resize", updateWindowSize)
    })

    onCleanup(() => {
        window.removeEventListener("resize", updateWindowSize)

        lightingDispose()
        sceneDispose()
    })

    return (
        <SceneContext.Provider
            value={{
                scene,
                camera,
                addDrawDirective,
                addToScene,
            }}
        >
            {renderer.domElement}
            {props.children}
        </SceneContext.Provider>
    )
}

export const useScene = () => {
    const context = useContext(SceneContext)

    if (!context) {
        throw new Error("useScene must be used within a SceneProvider")
    }

    return context
}

export default SceneProvider
