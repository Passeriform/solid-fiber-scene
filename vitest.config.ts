import solidPlugin from "vite-plugin-solid"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [solidPlugin()],
    test: {
        environment: "jsdom",
        setupFiles: ["@testing-library/jest-dom/vitest", "mocks/gl2", "mocks/raf"],
    },
})
