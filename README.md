# butia-microbit-extension

A [MakeCode](https://makecode.microbit.org/) extension for the [micro:bit](https://microbit.org/) that brings the **Butia v4 educational robotics kit** into the classroom with drag-and-drop blocks.

[![MakeCode](https://img.shields.io/badge/MakeCode-micro%3Abit-blue)](https://makecode.microbit.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)

> Developed as part of a Computer Engineering thesis at the Faculty of Engineering, Universidad de la República, Uruguay. See the [Butia project page](https://www.fing.edu.uy/inco/proyectos/butia/).

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

The Butia blocks appear in the toolbox immediately, under two separate categories — **Butia v2** and **Butia v4** — each with the groups **Motors**, **Sensors**, **Generic Sensors** and **Servos**. Pick blocks from only one category per program; mixing v2 and v4 blocks in the same program is not supported.

## Block API Reference

English is the base language of the blocks; Spanish is shipped as a locale (`_locales/es/`) and is what students see when the editor is set to Spanish. The reference below uses the English text.

`%connector` is a Butia connector picker. Available connectors depend on the active robot model — **J1–J5** on Butia v4, **J1–J3** on Butia v2.

### Robot Model

The extension supports both the **Butia v4** and **Butia v2** kits, each with its own toolbox category and its own full set of blocks. The active model is determined by which category's blocks you use — there is no separate robot-selector or "start" block; the robot starts automatically the first time any block from its category runs.

| Block | Description | Parameters |
|---|---|---|
| `Butia v2 use map %map` | Selects which botsim map to run against for a Butia v2 program. Optional — if omitted, botsim shows its "no map selected" screen instead of running the simulation. | `map`: `line follower` / `table` / `light` |
| `Butia v4 use map %map` | Selects which botsim map to run against for a Butia v4 program. Optional — if omitted, botsim shows its "no map selected" screen instead of running the simulation. | `map`: `line follower` / `table` / `light` |

### Motors

| Block | Description | Parameters |
|---|---|---|
| `move forward at speed %speed \|\| for %duration seconds` | Drives both motors forward. Runs indefinitely, or for `duration` seconds if given. | `speed`: 0–100 (default 50) · `duration`: seconds, optional |
| `move backward at speed %speed \|\| for %duration seconds` | Drives both motors backward. Runs indefinitely, or for `duration` seconds if given. | `speed`: 0–100 (default 50) · `duration`: seconds, optional |
| `turn %direction at speed %speed \|\| for %duration seconds` | Turns in place toward left/right. | `direction`: left/right · `speed`: 0–100 (default 40) · `duration`: seconds, optional |
| `motor left %left right %right` | Sets each motor's speed independently (tank drive). | `left`, `right`: -100–100 (default 70) |
| `stop motors` | Stops both motors. | — |
| `stop motor %motor` | Stops a single motor, leaving the other running. | `motor`: left/right |

### Sensors

| Block | Description | Returns |
|---|---|---|
| `gray sensor on %connector` | Reads the analog gray/line sensor on the given connector (0–100, higher = darker). | `number` |
| `light sensor on %connector` | Reads the light sensor on the given connector (0–100). | `number` |
| `distance sensor on %connector` | Reads the distance sensor on the given connector, in cm. | `number` |
| `button on %connector pressed` | Whether the button on the given connector is currently pressed. | `boolean` |

### Generic Sensors

| Block | Description | Returns |
|---|---|---|
| `$sensorName sensor on $connector` | Reads a generic analog sensor. `sensorName` is a dynamic enum — pick an existing name or create one from the dropdown. | `number` |

### Servos

| Block | Description | Parameters |
|---|---|---|
| `servo $servoName on $connector set angle to $degrees °` | Positions a servo. `servoName` is a dynamic enum, like the generic sensors. | `degrees`: 0–180 (default 90) |

### Events (advanced)

Reactive blocks that run a handler when a sensor condition holds, guarded by a `priority` (1 lowest–5 highest) so only the highest-priority satisfied handler runs per cycle.

The monitor polls every 50 ms and runs handlers **synchronously**, so a handler that blocks (for example a movement with a duration) delays every other rule until it returns. Keep handlers short unless the blocking is intentional.

| Block | Fires when |
|---|---|
| `when distance sensor on %connector is %op %threshold cm with priority %priority` | Distance compares against `threshold` (cm) using `op`. Readings of 0 or less are ignored as "no measurement". |
| `when light sensor on %connector is %op %threshold with priority %priority` | Light reading compares against `threshold` |
| `when gray sensor on %connector is %op %threshold with priority %priority` | Gray reading compares against `threshold` |
| `when button on %connector is %state with priority %priority` | Button is `pressed`/`released` |

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
| `npm run loc` | Regenerate `_locales/*-strings.json` from the source `//% block` text — run after adding/renaming a block |
| `npm run serve` | Local MakeCode editor + botsim dev server (see [SIMULATOR.md](SIMULATOR.md)) |
| `npm run deploy` | Flash `built/binary.hex` to a connected micro:bit |
| `make clean` | Remove `built/` output |

`npm test` compiles the test files but does not execute the assertions — `assertTest`/`control.fail` only run on hardware or in the simulator. Treat a green `npm test` as "it still compiles", not "it still works".

To test a local build in the editor: `npm run build`, then in MakeCode go to ⚙ → **Extensions** → **Import File** and upload `built/binary.hex`. See [SIMULATOR.md](SIMULATOR.md) for running the botsim simulator locally.

## Project Structure

```
src/
├── main.ts         # Runtime entry point — starts the robot singleton
├── robotdriver.ts  # RobotDriver singleton, swaps in the sim robot when applicable
├── types/          # Ambient interfaces and const enums
├── core/           # RobotBase (DI base class) + constants, connector, logger, event-monitor
├── hardware/       # Concrete hardware drivers (motors, gray/light/distance/button/generic sensors, servo)
├── sim/            # MakeCode simulator bridge — swaps hardware drivers for sim equivalents
└── blocks/         # blocks.ts — the public MakeCode block API documented above
test/               # Unit tests, excluded from the extension build
codigos/            # Classroom programs used to exercise the botsim maps
scripts/            # Dev tooling (sync-pxt.ts, serve.ts)
botsim/             # The simulator: a standalone React/Vite app with its own package.json
```

All extension code lives under the `Butia` namespace, and the shared enums are prefixed `Butia*`, so nothing collides with other MakeCode extensions.

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
