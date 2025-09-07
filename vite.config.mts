import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
    build: {
        lib: {
            entry: "lib/index.ts",
            name: "Scene",
            formats: ["es", "cjs"],
            fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
        },
        rollupOptions: {
            output: {
                exports: "named",
            },
        },
    },
    plugins: [
        solidPlugin(),
        externalizeDeps(),
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
        }),
    ],
})
