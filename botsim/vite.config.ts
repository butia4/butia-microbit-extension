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
})
