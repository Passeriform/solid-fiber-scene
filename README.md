# @passeriform/solid-fiber-scene

**ThreeJS declarative scene and renderer for SolidJS.**

---

## Overview

`@passeriform/solid-fiber-scene` provides a declarative way to create and manage ThreeJS scene and renderer within a SolidJS application. Using the `SceneProvider` as the hoist and `useScene` hook as the interface, you can control your 3D scene directly from your component tree.

---

## Installation

```bash
npm install @passeriform/solid-fiber-scene
# or
yarn add @passeriform/solid-fiber-scene
```

---

## Usage

### Basic Example

```tsx
import SceneProvider, { useScene } from "@passeriform/solid-fiber-scene"
import { onCleanup, onMount } from "solid-js"
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three"

const Cube = () => {
    const { addToScene } = useScene()

    const cubeMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xff0000 }))

    onMount(() => {
        addToScene(cubeMesh)
    })

    onCleanup(() => {
        cubeMesh.clear()
    })

    return <></>
}

const App = () => {
    return (
        <SceneProvider ambientLightColor={0xffffff} directionalLightPosition={{ x: 1, y: 2, z: 3 }}>
            <Cube />
            {/* ... */}
        </SceneProvider>
    )
}

export default App
```

---

## API

### `SceneProvider`

A context provider that sets up:

- ThreeJS `Scene` and `PerspectiveCamera`
- `WebGLRenderer` with auto-resizing
- `Ambient` and `Directional` lighting
- Animation loop using draw directives

```tsx
<SceneProvider>{/* Components that will use scene and camera */}</SceneProvider>
```

Props:

```ts
type SceneProviderProps = {
    onWebGLError?: (div: HTMLDivElement) => void
    ambientLightColor?: number
    directionalLightPosition?: Vector3
}
```

### `useScene()`

Hook to access the scene context:

```ts
const { scene, camera, addToScene, addDrawDirective } = useScene()
```

- `scene` — ThreeJS `Scene` object
- `camera` — ThreeJS `PerspectiveCamera`
- `addToScene(object: Object3D)` — add a mesh, light, or object to the root of `Scene` object
- `addDrawDirective(identifier: string, callback: XRFrameRequestCallback, options?)` — add a custom draw function, e.g., for animation or XR frames

---

## Draw Directives

Draw directives allow you to define reusable frame callbacks that integrate into the animation loop:

```ts
addDrawDirective(
    "ROTATE_CUBE",
    (time, frame) => {
        cube.rotation.y = time / 1000
    },
    { onCollision: "REPLACE" },
)
```

- `identifier` — unique string for the directive
- `callback` — function called each frame
- `options` — options for the directive

    | Option      | Description                                                                   | Values              | Default  |
    | :---------- | :---------------------------------------------------------------------------- | :------------------ | :------- |
    | onCollision | control collision strategy (replace existing directive if duplicate inserted) | `REPLACE \| APPEND` | `APPEND` |

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you want to add features, fix bugs, or improve documentation.

---

## License

MIT License
