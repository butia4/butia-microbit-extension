import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    base: "./",
    server: { port: 5173 },
    test: {
        environment: "jsdom",
        globals: true,
        // pixi.js does WebGL feature-detection at import time, which is slow
        // under jsdom (no real GPU/canvas) — rangeSensor.ts now transitively
        // imports the renderer module (decision #4, sonar wave/ping visuals),
        // so bump the default 5s timeout to give that import headroom.
        testTimeout: 20000,
    },
})
