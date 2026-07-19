import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: "./",
    server: { port: 5173 },
    // Single-bundle iframe app (physics engine + React) legitimately exceeds
    // the default 500kB heuristic — code-splitting isn't warranted here.
    build: { chunkSizeWarningLimit: 1000 },
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
