# botsim

Simulador de robot en navegador para la extensión [Butia v4](https://github.com/butia4/butia-microbit-extension) de MakeCode/PXT (micro:bit), el proyecto principal. Se carga como iframe dentro del editor de MakeCode y se comunica con la extensión vía `control.simmessages` / `window.postMessage`.

Vive en `butia-microbit-extension/botsim` como app independiente del toolchain de PXT (propio `package.json`, propio `node_modules`).

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Redux Toolkit](https://redux-toolkit.js.org/) para el estado global
- [planck](https://piqnt.com/planck.js/) para la física 2D
- [pixi.js](https://pixijs.com/) para el renderizado
- [Tailwind CSS](https://tailwindcss.com/) para estilos
- [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) para formularios

## Comandos

```bash
npm install        # instalar dependencias
npm run dev         # servidor de desarrollo (http://localhost:5173)
npm run build       # tsc + build de producción → dist/
npm run preview     # previsualizar el build de producción
```

Para correr el simulador junto al editor de MakeCode, ver [`SIMULATOR.md`](../SIMULATOR.md) en la raíz de `butia-microbit-extension`.

## Estructura

```
src/
├── botSpecs/         # especificación física/visual del robot Butia
├── context/          # contextos de React
├── layout/           # layout de la app
├── maps/             # mapas/escenarios del simulador
├── pages/            # páginas (organizadas internamente por tipo)
├── redux/            # store y slices de Redux
├── shared/            # código compartido entre features (hooks, tipos)
├── sim/              # motor de simulación (física, bot, renderizado)
└── simulatorBridge/  # capa de protocolo de comunicación con MakeCode
```

El código se organiza por responsabilidad: lo compartido entre features vive en carpetas top-level (`shared/`, `sim/`, `simulatorBridge/`, `botSpecs/`), y lo específico de una sola feature se anida dentro de su propia carpeta (por ejemplo `pages/PinSettings/`).

> Este repo no tiene suite de tests y no deben agregarse (ver `CLAUDE.md`).

## Deploy

El push a `master` con cambios en `botsim/` dispara automáticamente el workflow [`deploy.yml`](../.github/workflows/deploy.yml) (en la raíz de `butia-microbit-extension`), que builda el proyecto y lo publica en GitHub Pages.
