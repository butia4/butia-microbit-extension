# Local Project Setup

## 1. Install and build the extension

```sh
npm install
npm run build
```

## 2. Clone pxt-microbit

Clone it next to this repo (not inside it):

```sh
git clone https://github.com/microsoft/pxt-microbit.git
cd pxt-microbit
npm install
```

## 3. Bump pxt-core

Edit `pxt-microbit/package.json`, under `"dependencies"`, set:

```json
"pxt-core": "^13.2.4"
```
If the automatically downloaded version causes any problems, explicitly specify "pxt-core": "13.2.4".
Then, from `pxt-microbit/`:

```sh
npm install pxt-core@13.2.4
```

## 4. Register the extension for simulator dev mode

In `pxt-microbit/targetconfig.json`, add under `packages.approvedRepoLib`:

```json
"butia4/butia-microbit-extension": {
    "simx": { "sha": "", "devUrl": "http://localhost:5173" }
}
```

In `pxt-microbit/pxtarget.json`, add under `simulator.testSimulatorExtensions`:

```json
"butia4/butia-microbit-extension": {
    "devUrl": "http://localhost:5173"
}
```

## 5. Start the local MakeCode editor

From the `pxt-microbit` clone (in another terminal):

```sh
npx pxt serve --noBrowser
```

This prints a URL containing a `local_token`(save it). 

## 6. Start the botsim dev server

From this repo's `botsim/` folder:

```sh
cd botsim
npm run dev
```

Leave this running (default: `http://localhost:5173`).


## 7. Open the editor

Take the printed URL and add `?simxdev` right before the `#`:

```
http://localhost:3232/?simxdev#local_token=<token>&wsport=<port>
```

Open that exact URL.

## 8. Create a MakeCode project

On the home screen, click **New Project**, give it a name, click **Create**.

## 9. Import the extension

In the editor: ⚙ → **Extensions** → **Import File** → select `built/binary.hex` from this repo.

## 10. Run

Run the program. The botsim iframe (`http://localhost:5173`) should appear next to the micro:bit simulator.

## Clearing stale browser data

The local editor stores projects/session in the browser's IndexedDB for `localhost:3232`. Clear it before a fresh setup, or if the editor behaves unexpectedly (blocks not matching current source, botsim iframe missing):

- Chrome/Edge: DevTools → **Application** → **Storage** → **Clear site data** (scoped to `http://localhost:3232`).
- Firefox: DevTools → **Storage** → right-click each entry under `localhost:3232` → **Delete All**.

## Troubleshooting checklist

1. `rm -rf node_modules package-lock.json && npm install`
2. `npm run build`
3. Clear browser storage for `localhost:3232`
4. Re-run `npx pxt serve --noBrowser` from the `pxt-microbit` clone, re-open the URL with `?simxdev`, re-import `built/binary.hex`
