# Running the Botsim Simulator Locally

## Steps

1. Start the botsim dev server (from the sibling `butia-botsim` repo):

   ```sh
   cd ../butia-botsim
   npm run build
   npm run dev
   ```

2. In another terminal, from the repo root, serve the extension:

   ```sh
   npm run serve
   ```

   This patches `node_modules/pxt-microbit/built/target.js` so the local editor knows to open an iframe pointing at botsim, builds the extension, and starts the local MakeCode editor (`pxt serve`).

3. Open the browser at the URL printed by `npm run serve`, adding `?simxdev`, e.g.:

   ```
   http://localhost:3232/index.html?simxdev#editor
   ```

   Import `built/binary.hex` as a project (⚙ Settings → Extensions → Import File) — searching "butia" won't find it, since it isn't published. Run the program; the botsim iframe (`http://localhost:5173`) should appear next to the micro:bit simulator.

## Notes

- The `target.js` patch lives in `node_modules/`, so it's disposable — `npm run serve` reapplies it automatically on every run, including after a fresh `npm install`.
- If the iframe doesn't appear: confirm botsim is running on port 5173, confirm the URL has `?simxdev`, and hard-refresh the browser (not just re-run the program).
