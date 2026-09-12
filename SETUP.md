# Local Project Setup

Steps to get a clean local environment running, whether it's your first time cloning the repo or you're coming back after a while.

## 1. Clean install

Delete `node_modules` and reinstall before starting, especially after pulling new changes or switching branches. This project depends on `pxt-microbit` as a `devDependency`, and `npm run serve` patches a file inside its installed copy (`node_modules/pxt-microbit/built/target.js`) — a stale or partially-patched `node_modules` is a common source of confusing failures.

```sh
rm -rf node_modules package-lock.json
npm install
```

## 2. Build the extension

```sh
npm run build
```

This compiles TypeScript into `built/binary.hex`. Run `npm run sync` first if you added, renamed, or deleted any `.ts` file under `src/`/`test/`.

## 3. Start the local editor + simulator

1. Start the botsim dev server (from the local `botsim/` folder):

   ```sh
   cd botsim
   npm run build
   npm run dev
   ```

2. In another terminal, from the repo root, serve the extension:

   ```sh
   npm run serve
   ```

   This patches `node_modules/pxt-microbit/built/target.js` so the local editor knows to open an iframe pointing at botsim, builds the extension, and starts the local MakeCode editor (`pxt serve`).

3. `npm run serve` prints a URL containing a `local_token` — use that exact URL, not a hand-typed one (the editor can't authenticate to the local workspace without it). Add `?simxdev` to it, e.g.:

   ```
   http://localhost:3232/?simxdev#local_token=<the token printed in your terminal>&wsport=3233
   ```

4. Push your branch to GitHub, then add the extension by URL: ⚙ → **Extensions**, paste `https://github.com/butia4/butia-microbit-extension#<your-branch-name>` into the search box and press Enter, then click the resulting card to add it. Run the program; the botsim iframe (`http://localhost:5173`) should appear next to the micro:bit simulator.

   **There is no "Import File" button for a local, unpushed build in this editor version.** `pxt-microbit@8.x` (pinned in `package.json`) bundles `pxt-core@12.3.29`, whose "Extensions" screen (`ExtensionsBrowser`) dropped that button — confirmed by inspecting the served `main.js`: the component still renders an import-related modal, but nothing in it ever triggers opening that modal. `npm run build`'s `built/binary.hex` is therefore not something you can hand to the editor directly; the editor always fetches extension source from GitHub. This means **every code change needs a push before you can see it in the block editor** — there's no offline/uncommitted iteration loop for this step. Amend and force-push your WIP branch to reuse the same URL instead of accumulating commits.

Notes:

- The `target.js` patch lives in `node_modules/`, so it's disposable — `npm run serve` reapplies it automatically on every run, including after a fresh `npm install`.
- If the iframe doesn't appear: confirm botsim is running on port 5173, confirm the URL has `?simxdev`, and hard-refresh the browser (not just re-run the program).
- `https://github.com/owner/repo#ref` also accepts a tag, e.g. a released version tag, in place of a branch name.

## 4. Clear stale browser data before opening the editor

The local MakeCode editor doesn't store your projects/session on disk — it uses the browser's **IndexedDB** for that origin (`localhost:3232`). Leftovers from a previous run (an older extension build, a stale project, a half-applied simulator patch) can cause confusing symptoms: blocks that don't match your current source, or the botsim iframe not appearing.

Before starting a fresh setup, or whenever the editor behaves unexpectedly, clear the site data for that origin:

- Chrome/Edge: DevTools → **Application** tab → **Storage** → **Clear site data** (make sure you're scoped to `http://localhost:3232`).
- Firefox: DevTools → **Storage** tab → right-click each entry (IndexedDB, Local Storage, Cookies) under the `localhost:3232` origin → **Delete All**.

This clears IndexedDB, `localStorage`, and cookies for that origin in one action — a normal browser cache clear is not enough, since IndexedDB isn't affected by "clear cache" alone on most browsers.

## Troubleshooting checklist

If something looks wrong after pulling changes or switching branches, work through this in order:

1. `rm -rf node_modules package-lock.json && npm install`
2. `npm run build`
3. Clear browser storage for `localhost:3232` (step 4 above)
4. Re-run `npm run serve`, push your branch, and re-add the extension by URL (step 3.4 above)
