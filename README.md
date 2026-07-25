# Butia v4 MakeCode Extension

A [MakeCode](https://makecode.microbit.org/) extension for the [micro:bit](https://microbit.org/) that brings the **Butia v4 educational robotics kit** into the classroom with drag-and-drop blocks.

[![MakeCode](https://img.shields.io/badge/MakeCode-micro%3Abit-blue)](https://makecode.microbit.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)

> Developed as part of a Computer Engineering thesis at the Faculty of Engineering, Universidad de la República, Uruguay. The block API may evolve during active development.

## Table of Contents

- [Using the Extension](#using-the-extension)
- [Block API Reference](#block-api-reference)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Thesis Team](#thesis-team)

## Using the Extension

1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/) and create a **New Project**.
2. Go to ⚙ → **Extensions**.
3. Search for or paste `https://github.com/butia4/butia-microbit-extension` and click **Import**.

The Butia blocks appear in the toolbox immediately, grouped as **Motores**, **Sensores**, and **Simulador**.

## Block API Reference

Block text is in Spanish, as required for classroom use in Uruguay; the reference below is in English for maintainers.

### Motores

| Block | Description | Parameters |
|---|---|---|
| `Avanzar a velocidad %speed \|\| durante %duration segundos` | Drives both motors forward. Runs indefinitely, or for `duration` seconds if given. | `speed`: 0–100 (default 50) · `duration`: seconds, optional |
| `Retroceder a velocidad %speed \|\| durante %duration segundos` | Drives both motors backward. Runs indefinitely, or for `duration` seconds if given. | `speed`: 0–100 (default 50) · `duration`: seconds, optional |
| `Girar hacia %direction a velocidad %speed \|\| durante %duration segundos` | Turns in place toward `Izquierda`/`Derecha`. | `direction`: Left/Right · `speed`: 0–100 (default 40) · `duration`: seconds, optional |
| `Motor Izquierdo %left Derecho %right` | Sets each motor's speed independently (tank drive). | `left`, `right`: -100–100 (default 70) |
| `Detener Motores` | Stops both motors. | — |
| `Detener Motor %motor` | Stops a single motor, leaving the other running. | `motor`: Izquierdo/Derecho |

### Sensores

| Block | Description | Returns |
|---|---|---|
| `Sensor de grises en %connector` | Reads the analog gray/line sensor on the given connector. | `number` |
| `Sensor de luz en %connector` | Reads the light sensor on the given connector. | `number` |
| `Sensor de distancia en %connector` | Reads the ultrasonic distance sensor on the given connector (cm). | `number` |
| `Botón en %connector presionado` | Reads whether the button on the given connector is currently pressed. | `boolean` |
| `Sensor genérico en %connector` | Reads a generic analog sensor on the given connector. | `number` |

`%connector` is a Butia connector picker (e.g. C1–C4).

### Eventos (advanced)

Reactive blocks that run a handler when a sensor condition is met, guarded by a `priority` (1 highest–5 lowest) so only the highest-priority active handler fires at a time.

| Block | Fires when |
|---|---|
| `Cuando el sensor de distancia en %connector sea %op %threshold cm con prioridad %priority` | Distance reading compares against `threshold` (cm) using `op` (mayor/menor que, etc.) |
| `Cuando el sensor de luz en %connector sea %op %threshold con prioridad %priority` | Light reading compares against `threshold` |
| `Cuando el sensor de grises en %connector sea %op %threshold con prioridad %priority` | Gray sensor reading compares against `threshold` |
| `Cuando se %state el botón en %connector con prioridad %priority` | Button transitions to `presione`/`suelte` |

### Simulador

| Block | Description |
|---|---|
| `usar mapa %map` | Selects the botsim map (`Seguidor de línea`, `Mesa`, `Luz`) used when the project runs in the MakeCode simulator. No effect on real hardware. |

## Development

```bash
git clone https://github.com/butia4/butia-microbit-extension.git
cd butia-microbit-extension
npm install       # installs dev tools (pxt, TypeScript, ESLint)
```

| Command | Purpose |
|---|---|
| `npm run build` | Compile TypeScript → `built/binary.hex` |
| `npm test` | Run the test suite (`test/`, via `pxt test`) |
| `npm run typecheck` | Type-check without emitting files |
| `npm run lint` | ESLint |
| `npm run sync` | Sync `src/`/`test/` file lists into `pxt.json` — run after adding/renaming/deleting a `.ts` file |
| `npm run deploy` | Flash `built/binary.hex` to a connected micro:bit |
| `make clean` | Remove `built/` output |

To test a local build in the editor: `npm run build`, then in MakeCode go to ⚙ → **Extensions** → **Import File** and upload `built/binary.hex`. See [SIMULATOR.md](SIMULATOR.md) for running the botsim simulator locally.

## Project Structure

```
src/
├── main.ts       # Runtime entry point — starts the robot singleton
├── types/        # Ambient interfaces and const enums
├── core/         # RobotBase (DI base class) + constants, connector, logger, event-monitor
├── hardware/     # Concrete hardware drivers (motors, line/light/distance/button/generic sensors)
├── sim/          # MakeCode simulator bridge — swaps hardware drivers for sim equivalents
└── blocks/       # blocks.ts — the public MakeCode block API documented above
test/             # Unit tests, excluded from the extension build
scripts/          # Dev tooling (sync-pxt.ts)
```

## Contributing

Open an issue before submitting a pull request to align on the proposed change.

## License

MIT — see [LICENSE.txt](LICENSE.txt).

## Thesis Team

| Name | GitHub | LinkedIn |
|------|--------|----------|
| Bryan Salamone | [@IngBryan](https://github.com/IngBryan) | [linkedin](https://uy.linkedin.com/in/bryan-salamone-ab65401b3) |
| Mayte Carro | [@mayyte](https://github.com/mayyte) | [linkedin](https://www.linkedin.com/in/mayte-carro-valle-475705290/) |
| Bruno Pons | [@bruaguspons](https://github.com/bruaguspons) | [linkedin](https://www.linkedin.com/in/brunopons/) |

---

### Metadata (used for MakeCode search and GitHub Pages rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
