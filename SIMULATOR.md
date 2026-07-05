# Running the Botsim Simulator Locally

This document explains, step by step, how to run the custom Butia robot simulator (`botsim/`) fully **locally** — no GitHub push, no publishing the extension, no flashing a physical micro:bit. It also documents *why* each step is necessary, because the MakeCode/PXT local dev loop has several non-obvious gotchas that will silently fail if skipped.

## Architecture in one paragraph

`botsim/` is a standalone Vite + React app (physics/2D simulator for the Butia robot). It talks to the MakeCode simulator over the browser's `postMessage` API, using PXT's `control.simmessages` bridge. On the extension side, `src/sim/sim-motor-driver.ts` and `src/sim/sim-robot.ts` send/receive messages on the channel `"butia4/butia-microbit-extension"`. On the botsim side, `botsim/src/services/makecodeService.ts` listens for `window.postMessage` events filtered by that same channel string. MakeCode's local editor needs to be told, out-of-band, to open an iframe pointing at the botsim dev server whenever it sees a message on that channel — that wiring is what most of this document is about.

## Prerequisites

- `botsim/` dependencies installed (`cd botsim && npm install`).
- `butia-microbit-extension` dependencies installed (`npm install` at the repo root) — this also installs a private copy of the `pxt-microbit` target under `node_modules/pxt-microbit` (see "Which `pxt-microbit` gets used" below).
- The `pxt` CLI available (installed as part of the root `npm install`, invoked via `npx pxt` or the `npm run build`/`pxt serve` scripts).

## Step-by-step

### 1. Start the botsim dev server

```sh
cd butia-microbit-extension/botsim
npm run dev
```

This serves the simulator UI at **`http://localhost:5173`** (fixed port, set in `botsim/vite.config.ts`). Leave this running.

### 2. Build the extension

```sh
cd butia-microbit-extension
npm run build
```

Produces `built/binary.hex`. Re-run this after every code change you want to test.

### 3. Serve the local MakeCode editor

```sh
cd butia-microbit-extension
pxt serve
```

This opens a local editor, normally at `http://localhost:3232`.

> **Important:** running `pxt serve` from inside the extension folder does **not** automatically load the extension as a project. `pxt.json` here has no `pxtarget.json`, so the PXT CLI `chdir`s into the resolved target (`node_modules/pxt-microbit`) and serves that target's plain, empty editor. Your Butia blocks will **not** appear just because the server is running — see step 4.

### 4. Import the extension into a project

In the browser, at the local editor:

1. ⚙ (Settings) → **Extensions**
2. **Import File**
3. Upload `built/binary.hex`

Do **not** try to find it by searching "butia" in the Extensions search box — that search only returns extensions that are *approved/published* to MakeCode's extension directory. An unpublished local extension will never show up there. Importing the `.hex` (or, if you ever push to GitHub, pasting the repo URL) are the only supported ways to load it. There is also no "local folder path" or `file:`-style dependency the editor's package resolver understands — only `pub:`, `github:`, `embed:`, and `pkg:` protocols exist.

After import, Butia's blocks should appear in the block palette.

### 5. Enable simulator-extension dev mode in the URL

Add `?simxdev` to the editor URL, e.g.:

```
http://localhost:3232/index.html?simxdev#editor
```

Without this query parameter, PXT will **ignore** any local dev URL you configure for the simulator iframe in step 6, even if it's set correctly.

### 6. Register the botsim dev URL in the target config

This is the step that's easy to get wrong — see "Why this is so fiddly" below for the full explanation. The short version:

Edit **`butia-microbit-extension/node_modules/pxt-microbit/built/target.js`** (not `pxtarget.json`, not `target.json` — see below) and find the `"testSimulatorExtensions"` key inside the `simulator` object. It normally looks like:

```json
"testSimulatorExtensions": {}
```

Change it to:

```json
"testSimulatorExtensions": {
    "butia4/butia-microbit-extension": {
        "devUrl": "http://localhost:5173"
    }
}
```

`target.js` is a single minified line, so the easiest way to do this safely is with `sed`:

```sh
cd butia-microbit-extension/node_modules/pxt-microbit/built
cp target.js target.js.bak
sed -i 's|"testSimulatorExtensions":{}|"testSimulatorExtensions":{"butia4\/butia-microbit-extension":{"devUrl":"http:\/\/localhost:5173"}}|' target.js
```

(Optionally do the same to `target.json` for consistency, though it isn't actually read by the browser — see below.)

No server restart is needed for this — it's a static file the server reads straight off disk. A **browser hard refresh** is enough.

### 7. Run the program

Click Run in the local editor with the imported Butia project. `RobotDriver.start(...)` runs unconditionally at the top of `main.ts`, and the sim-side `_butiaSimInit()` (`src/sim/sim-robot.ts`) starts sending a state message on the `"butia4/butia-microbit-extension"` channel every 50ms as soon as the program starts — you don't need to trigger any specific motor/sensor block first. An iframe loading `http://localhost:5173` should appear next to the standard micro:bit board simulator.

## Why this is so fiddly (background / troubleshooting reference)

### `pxt serve` inside an extension folder serves the target, not your extension

Confirmed in `pxt-core`'s CLI source (`serveAsync`): if the current directory has no `pxtarget.json`, the CLI resolves the linked target directory (`node_modules/pxt-microbit`, per `node_modules/pxtcli.json` → `targetdir`) and `chdir`s into it before building/serving. The extension's own code is irrelevant to what gets served until you explicitly import it as a project (step 4).

### Editing `pxtarget.json` (the source manifest) does nothing here

`pxt serve` / `pxt buildtarget` try to fully rebuild the target from source on every run. In this environment that rebuild **fails immediately**:

```
error TS5023: Unknown compiler option 'ignoreDeprecations'.
```

This is a TypeScript version mismatch between the version installed here (`typescript@^6.0.3`, from the extension's own `package.json`) and what the bundled target-build pipeline expects. The failure happens early (during the `compiler/` folder build, inside `internalBuildTargetAsync`), *before* the step that regenerates the built target config — so any edit to `pxtarget.json` is silently never applied, no matter how many times you restart `pxt serve`. You can reproduce/confirm this yourself with `npx pxt buildtarget`.

Because of this, the fix has to be applied directly to the **already-built** output files instead of the source manifest.

### Two "built" files, only one of which the browser actually loads

- `built/target.json` — a plain JSON dump of the target manifest. Patching this alone **has no visible effect** — nothing in the served webapp fetches a file by this name at runtime.
- `built/target.js` — contains `var pxtTargetBundle = {...}` (see `targetJsPrefix` in `pxt-core`'s CLI source). This is injected as a `<script>` and becomes `window.pxtTargetBundle` → `pxt.appTarget` in the browser. **This is the file that must be patched.**

The webapp code itself (`main.js`) is a generic bundle shared across all PXT targets (it lives in `pxt-core/built/web/main.js`, not anywhere target-specific) — it reads simulator config dynamically from `pxtTargetBundle` at runtime rather than baking target-specific settings into its own build.

### `testSimulatorExtensions` vs. `targetconfig.json` vs. legacy `messageSimulators`

PXT actually has three related-but-different mechanisms for wiring a channel to a simulator iframe:

1. **`targetconfig.json` → `packages.approvedRepoLib.<org>/<repo>.simx`** — the "real"/production mechanism, used once an extension goes through MakeCode's approval process (has `sha`, `devUrl`, etc.). Not usable here since Butia isn't published/approved.
2. **`pxtarget.json` → `simulator.testSimulatorExtensions`** — explicitly documented in PXT's own type definitions as *"for testing new simulator extensions before adding them to targetconfig.json — do NOT ship simulator extensions here."* This is the mechanism this guide uses. It only requires a `devUrl`; `index`, `aspectRatio`, and `permanent` all have sane defaults.
3. **`pxtarget.json` → `simulator.messageSimulators`** — the deprecated predecessor of (1)/(2), keyed by channel, with separate `url` (production) and `localHostUrl` (local dev, gated by `?localhostmessagesims=1` instead of `?simxdev`). This is what Microsoft's own reference `microbit-robot` extension still uses (see its `pxt.json` / the vendored `pxt-microbit/pxtarget.json` in this workspace) — kept only as an architectural reference, not something to copy for Butia.

### The channel name is the identity

Whatever string is passed to `control.simmessages.send(...)`/`onReceived(...)` on the extension side must match, character for character, the key used in `testSimulatorExtensions` (or `approvedRepoLib`/`messageSimulators`). Butia's code already uses the GitHub `org/repo`-shaped string `"butia4/butia-microbit-extension"`, matching the convention used by `pxt-simx-sample` and `pxt-jacdac` in the vendored `pxt-microbit/targetconfig.json`.

## Caveats

- **The `target.js`/`target.json` patch is disposable.** It lives inside `node_modules/`, which is gitignored and gets wiped on `npm install`. Keep the `sed` command above handy — you'll need to re-apply it after any fresh install. This is consistent with PXT's own guidance that `testSimulatorExtensions` should never be shipped/committed.
- If you change the `control.simmessages` channel name in the extension code, update the `testSimulatorExtensions` key to match, or the bridge silently stops working with no console error.
- If the simulator iframe still doesn't appear after all steps: confirm `botsim` is actually running on port 5173, confirm the URL has `?simxdev`, confirm `built/target.js` (not `.json`) has the entry, and hard-refresh the browser (not just re-run the program).
