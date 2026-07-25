# Arquitectura del simulador (`botsim/`) y su bridge con la extensión PXT

> Documento generado leyendo el código fuente actual (rama `feat/botsim`). Cada afirmación
> incluye ruta de archivo (y línea cuando es razonablemente estable). Donde el código difiere
> de lo que dice `CLAUDE.md`, se señala explícitamente como **discrepancia verificada**.

## 0. Nota importante: discrepancias con `CLAUDE.md`

`CLAUDE.md` describe una arquitectura que **ya no coincide** con el código actual en varios puntos:

- **Nombres de función**: `CLAUDE.md` menciona `registerSim()` y `startSendSimLoop()`. En el
  código real esas funciones no existen; las funciones equivalentes son
  `_registerButiaSimRobot()` (`src/sim/sim-robot.ts:45`) y `_butiaSimInit()`
  (`src/sim/sim-robot.ts:11`).
- **Canal de `control.simmessages`**: `CLAUDE.md` dice que el canal es `"butia"`. El canal real,
  usado en ambos extremos, es `"butia4/butia-microbit-extension"` (`src/sim/sim-motor-driver.ts:5`,
  `src/sim/sim-sensors.ts:14`, y en el lado del botsim `botsim/src/simulatorBridge/makecodeService.ts:20,66`).
- **Drivers de hardware**: `CLAUDE.md` habla de `AnalogLineSensor` y `SR04DistanceSensor`. Esos
  nombres no existen en `src/hardware/`; los archivos reales son `distance-sensor-butia.ts`,
  `gray-sensor-butia.ts`, `light-sensor-butia.ts`, `button-sensor-butia.ts`,
  `generic-sensor-butia.ts`.
- **Loop de polling y `_applyAssists`**: `CLAUDE.md` describe un fiber en `RobotBase.start()` que
  llama `line.poll()` / `distance.poll()` cada `POLL_INTERVAL_MS` y aplica "assists" (p. ej.
  `ObstacleStop`). En el código actual, `RobotBase.start()` es un stub vacío
  (`src/core/robot-base.ts:268`, `start(): void {}`) y no existe ningún `_applyAssists` ni
  `ObstacleStop`. El polling real vive en `EventMonitor` (`src/core/event-monitor.ts`), que sí usa
  `POLL_INTERVAL_MS = 50` (línea 10) pero con un modelo de "monitors" registrados por
  `onDistance`/`onLight`/`onGray`/`onConnectorButton`, no un `.poll()` por sensor.
- **Convención "frontal face" (`y=-5`)**: en `botsim/src/botSpecs/butiaBotSpec.ts:23-24` los
  sensores frontales están en `y: -4`, no `y: -5`. El concepto ("adelante = hacia donde apuntan
  los sensores, lado `-y`") sigue siendo correcto, solo el valor numérico cambió.

El resto del documento describe el código **tal como está hoy**.

---

## 1. Extensión ↔ Simulador (el bridge)

### 1.1 Dónde se registra el simulador

- `src/robotdriver.ts:15-21` — `RobotDriver.start(instance)` es el punto de entrada llamado desde
  `src/main.ts:3` (`Butia.RobotDriver.start(Butia.Butia4_1_0)`). Ahí se llama
  `_registerButiaSimRobot(instance)` (línea 19) incondicionalmente, y luego
  `instance._robot.start()`.
- `_registerButiaSimRobot()` está definida en `src/sim/sim-robot.ts:44-47` con
  `//% shim=TD_NOOP` — es decir, en hardware real esta llamada es un no-op (PXT la reemplaza por
  nada), pero dentro del simulador de MakeCode el cuerpo sí ejecuta y llama
  `driver._setSimRobot(new Butia.ButiaSimRobot())` (línea 46), reemplazando el robot real
  (`Butia4_1_0`, hardware) por `Butia.ButiaSimRobot` dentro de `RobotDriver`.
- `ButiaSimRobot` (namespace `Butia`, `src/sim/sim-robot.ts:50-117`) extiende `RobotBase`
  (`src/core/robot-base.ts`) y sobreescribe `start()` (línea 73-76):
  ```ts
  start(): void {
      _butiaSimInit(() => this._buildSensorTypeMap());
      super.start();
  }
  ```
  `_butiaSimInit()` (línea 11, también `//% shim=TD_NOOP`) es la función equivalente a
  "`registerSim()`" mencionada en `CLAUDE.md` — solo corre dentro del simulador.

### 1.2 Canal de `control.simmessages`

El canal usado en **ambos extremos** es el string literal `"butia4/butia-microbit-extension"`:

- Envío extensión→sim: `src/sim/sim-motor-driver.ts:5`
  (`control.simmessages.send("butia4/butia-microbit-extension", ...)`).
- Recepción extensión←sim: `src/sim/sim-robot.ts:14`
  (`control.simmessages.onReceived("butia4/butia-microbit-extension", ...)`).
- Lado botsim: `botsim/src/simulatorBridge/makecodeService.ts:20` filtra mensajes entrantes por
  `ev.data.channel !== "butia4/butia-microbit-extension"`, y `makecodeService.ts:66` usa el mismo
  string al reenviar sensores hacia `window.parent`.

### 1.3 Formato y dirección de los mensajes

Hay **tres tipos de mensaje JSON**, definidos como TypeScript en el lado del botsim
(`botsim/src/simulatorBridge/protocol.ts:1-20`) y construidos como strings JSON crudos en el lado
de la extensión:

**a) `state` — extensión → simulador** (velocidades de motor + tipos de sensor activos)

- Construido por `buildButiaStateMessage()` (`src/sim/sim-motor-driver.ts:10-18`):
  ```ts
  { type: "state", id: runId, motorLeft: number, motorRight: number, sensors: { [connName: string]: string } }
  ```
- Se envía desde dos sitios:
  - `SimMotorDriver.setSpeed(left, right)` (`src/sim/sim-motor-driver.ts:29-35`), cada vez que un
    bloque de movimiento cambia la velocidad de motor.
  - El loop de fondo en `_butiaSimInit()` (`src/sim/sim-robot.ts:29-39`), que reenvía el mensaje
    `state` cada 50 ms (`basic.pause(50)`, línea 37) **incluso sin movimiento**, para mantener vivo
    el iframe del botsim y para que sensores usados sin un comando de motor incondicional
    (p. ej. solo `onDistance`) también terminen reportando su tipo (ver comentario largo en
    líneas 22-28 de ese archivo explicando el "startup deadlock" que esto evita).
  - `id` es un `runId` aleatorio (`SimState.runId = "" + Math.random()`, `sim-robot.ts:13`)
    generado una vez por ejecución del programa; sirve para que el botsim detecte "nueva
    ejecución" y resetee la simulación (ver 1.5).
  - `sensors` es un mapa `connName -> sensorType` ("distance" | "gray" | "light" | "button")
    construido por `ButiaSimRobot._buildSensorTypeMap()` (`sim-robot.ts:110-116`), que a su vez se
    llena cada vez que un bloque llama a un `_newXSensor` (líneas 78-100), es decir, la primera vez
    que el programa del usuario usa un conector como sensor de determinado tipo.

**b) `mapselect` — extensión → simulador** (selección de mapa)

- Construido por `buildButiaMapSelectMessage()` (`src/sim/sim-map.ts:15-20`):
  `{ type: "mapselect", id: number }`.
- `_butiaSimSelectMap(id)` (`sim-map.ts:7-11`, `//% shim=TD_NOOP`) fija `SimState.selectedMapId`
  una sola vez (`if (SimState.mapSelected) return`), pero el mensaje real se **reenvía en cada
  tick** del mismo loop de fondo de `_butiaSimInit()` (`sim-robot.ts:34-36`), no una sola vez — el
  comentario en `src/sim/sim-state.ts:8-11` explica por qué: un envío único puede llegar antes de
  que el iframe del botsim monte su listener `postMessage`, y como no hay cola/replay, se perdería
  silenciosamente.

**c) `sensors` — simulador → extensión** (valores leídos de los sensores)

- Tipo `ButiaSensorsMsg` (`botsim/src/simulatorBridge/protocol.ts:11-15`):
  `{ type: "sensors", id: string, values: Record<string, number> }`.
- Enviado por `sendSensors(id, values)` (`botsim/src/simulatorBridge/makecodeService.ts:63-67`) vía
  `window.parent.postMessage({ type: "messagepacket", channel: "butia4/butia-microbit-extension", data: payload }, "*")`.
- Recibido en la extensión por el handler registrado en `_butiaSimInit()`
  (`sim-robot.ts:14-16`): `control.simmessages.onReceived(..., (data) => applyButiaSensorsMessage(data.toString()))`.
- `applyButiaSensorsMessage()` (`src/sim/sim-state.ts:28-35`) parsea el JSON, valida
  `msg.type === "sensors" && msg.id === SimState.runId` (descarta mensajes de una ejecución
  anterior/obsoleta) y vuelca `values` dentro de `SimState.sensorCache` (un mapa
  `connName -> number`).

### 1.4 Drivers de sensor en el simulador (reemplazo de los drivers de hardware)

En `src/sim/sim-sensors.ts` hay cuatro clases que implementan las mismas interfaces que los
drivers de hardware reales (`IDistanceSensor`, `IGraySensor`, `ILightSensor`, `IButtonSensor` en
`src/types/components.d.ts`), pero en vez de leer un pin físico, leen de `SimState.sensorCache`:

- `SimDistanceSensor` (líneas 1-19), `SimGraySensor` (21-39), `SimLightSensor` (41-59),
  `SimButtonSensor` (61-79). Todas comparten el mismo patrón: `read()` devuelve
  `SimState.sensorCache[this._connName]` o un valor por defecto si aún no llegó nada (`-1` para
  distancia/gris/luz, `0` para botón).
- Estas clases sustituyen a los drivers reales del namespace `src/hardware/`
  (`distance-sensor-butia.ts`, `gray-sensor-butia.ts`, `light-sensor-butia.ts`,
  `button-sensor-butia.ts`) exactamente en los puntos donde `RobotBase` los instanciaría
  (`_newDistanceSensor`, `_newGraySensor`, `_newLightSensor`, `_newButtonSensor`,
  `src/core/robot-base.ts:71-75`): `ButiaSimRobot` sobreescribe esos cuatro métodos
  (`sim-robot.ts:78-100`) para devolver la versión "Sim*" en lugar de la de hardware, y además
  registra cada sensor creado en `this._simSensors` para poder construir el `sensorTypeMap` que
  viaja en el mensaje `state`.

### 1.5 Cómo recibe/parsea los mensajes el lado botsim (React)

El otro extremo del bridge vive en `botsim/src/simulatorBridge/`:

- `protocol.ts` — define los tipos de mensaje y dos funciones puras:
  `decodePacket(data)` (líneas 22-32, decodifica `ArrayBuffer` → JSON, soporta `state` y
  `mapselect`) y `encodePacket(msg)` (líneas 34-36, codifica un `ButiaSensorsMsg` a `Uint8Array`).
- `makecodeService.ts` — `init(opts)` (líneas 11-36) agrega un listener global de
  `window.addEventListener("message", ...)`. Filtra ruido de devtools (línea 15), y dentro del
  switch por `ev.data?.type`:
  - `"messagepacket"` con el channel correcto → `handlePacket()` (líneas 38-49) → despacha a
    `opts.onState` u `opts.onMapSelect` según `msg.type`.
  - `"stop"` → `opts.onStop?.()`.
  - `"debugger"` → `handleDebugger()` (líneas 51-61) → distingue `pause` de `resume`/`stepinto`.
- `useSimulatorLifecycle.ts` — hook de React que conecta el bridge con la instancia de
  `Simulation` (singleton, ver sección 4):
  - `handleState(msg)` (líneas 12-26): si `msg.id` cambió respecto al run anterior, resetea la
    simulación (`sim.reset(BUTIA_BOT_SPEC)`); si no, llama `sim.bot.setMotors(...)`,
    `sim.bot.setSensorMap(...)`, lee `sim.bot.readSensors()` y responde con `sendSensors(...)`.
  - `handleMapSelect(msg)` (líneas 53-69): resuelve el `MapSpec` vía `resolveMap(msg.id)`, espera
    `sim.ready` (init async de Pixi v8), y "arma" la simulación: `sim.loadMap()`,
    `sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, sensorSettings)` (usando `pinAssignment` y
    `sensorSettings` leídos del store de Redux, línea 58) y `sim.start()`.
  - `onStop`/`onPause`/`onResume` desarman o pausan la simulación sin perder el mapa/config
    (`disarm()`, líneas 43-51, y `rearmOnSettingsClose()`, líneas 70-81, usado al cerrar el panel
    de configuración de pines).

### 1.6 Round-trip completo (resumen)

1. Un bloque de MakeCode (p. ej. `moveForward`) llama a `RobotBase._setMotorSpeed()`
   (`src/core/robot-base.ts:127-131`) → `this._motors.setSpeed(left, right)`.
2. Si el robot activo es `ButiaSimRobot`, `this._motors` es un `SimMotorDriver`
   (`src/sim/sim-motor-driver.ts:20-40`), cuyo `setSpeed()` actualiza `SimState.motorLeft/Right`,
   reconstruye `sensorTypeMap` y llama `_butiaSimSend(buildButiaStateMessage(...))`.
3. `_butiaSimSend()` (`sim-motor-driver.ts:4-6`) hace
   `control.simmessages.send("butia4/butia-microbit-extension", Buffer.fromUTF8(msg), false)`.
4. El runtime de simulación de MakeCode reenvía ese buffer como `postMessage({type:"messagepacket", channel, data}, ...)`
   al iframe del botsim (mecanismo estándar de PXT, no hay código propio de este repo en el medio).
5. `makecodeService.init()` (`botsim/src/simulatorBridge/makecodeService.ts:12-36`) recibe el
   evento, filtra por canal, decodifica con `decodePacket()` y llama `opts.onState(msg)`.
6. `useSimulatorLifecycle`'s `handleState()` aplica `sim.bot.setMotors()` /`setSensorMap()` sobre el
   `Bot` activo (`botsim/src/sim/bot/index.ts`).
7. En el `Simulation.loop()` (`botsim/src/sim/index.ts:157-171`), a 60 Hz fijo, `Physics.update()`
   avanza el mundo Planck y `Bot.update()` mueve las ruedas (fuerzas, fricción lateral) — ver
   sección 2.
8. Cuando llega el próximo `state` (50 ms después, o inmediatamente tras un cambio de velocidad),
   `handleState()` llama `sim.bot.readSensors()` (`bot/index.ts:132-146`), que consulta
   `RangeSensor`/`SurfaceSensor`/`GraySensor`/`LightSensor` según el `sensorType` reportado y el
   `portAssignment` configurado por el usuario, y arma `Record<connName, number>`.
9. `sendSensors(id, values)` (`makecodeService.ts:63-67`) empaqueta esto como `ButiaSensorsMsg` y
   hace `window.parent.postMessage(...)` de vuelta hacia el simulador de MakeCode.
10. La extensión recibe esto en el handler de `_butiaSimInit()` (`sim-robot.ts:14-16`) →
    `applyButiaSensorsMessage()` (`sim-state.ts:28-35`) actualiza `SimState.sensorCache`.
11. El siguiente `read()` de `SimDistanceSensor`/`SimGraySensor`/etc. (`sim-sensors.ts`) devuelve
    ese valor cacheado — y `EventMonitor` (`src/core/event-monitor.ts`), que hace polling cada
    50 ms sobre esos mismos sensores, dispara los handlers `onDistance`/`onGray`/`onLight` del
    bloque reactivo del usuario si corresponde.

---

## 2. Configuración del robot

### 2.1 `butiaBotSpec.ts`

`botsim/src/botSpecs/butiaBotSpec.ts:6-30` define `BUTIA_BOT_SPEC: BotSpec`:

- `mass: 500` gramos.
- `chassis`: `{ shape: "square", side: 8 (cm), cornerRadius: 0.96 (cm) }` — comentario en línea 5
  aclara que es geometría placeholder escalada 0.8x desde un chasis original de 10 cm de lado.
- `wheels`: generadas por `toWheels()` (`botsim/src/botSpecs/botSpec.ts:64-77`) con
  `separation: 8cm`, `diameter: 3.2cm`, `width: 0.96cm`, `y: 1.6` (offset hacia atrás),
  `maxSpeed: 25` (clamp de velocidad solo-simulador, no afecta hardware).
- `sensorMounts` (líneas 22-29), seis montajes con `pos` (offset cm desde el centro del chasis) y
  `facingDeg` (0 = frente, convención "clockwise-positive" de `Vec2.rotateDeg`):
  - `frontLeft: { x: -2.4, y: -4 }, facingDeg: 0`
  - `frontRight: { x: 2.4, y: -4 }, facingDeg: 0`
  - `sideLeft: { x: -4, y: -1.6 }, facingDeg: -90`
  - `sideRight: { x: 4, y: -1.6 }, facingDeg: 90`
  - `rearLeft: { x: -2.4, y: 4 }, facingDeg: 180`
  - `rearRight: { x: 2.4, y: 4 }, facingDeg: 180`
  - El eje `y=-4` es la "cara frontal" (hacia adelante = -Y), tal como describe la convención de
    `CLAUDE.md`, aunque el valor numérico exacto es `-4`, no `-5`.

Los tipos (`MountSpec`, `MountSensorSpec`, `ChassisSpec`, `WheelSpec`, `BotSpec`) están en
`botsim/src/botSpecs/botSpec.ts:1-57`. `MountSide` (`"frontLeft" | "frontRight" | "sideLeft" |
"sideRight" | "rearLeft" | "rearRight"`) está en `botsim/src/botSpecs/mountSide.ts:1-2`, y
`ConnectorSlot` (`"J1".."J5"`) en `botsim/src/botSpecs/connectorSlot.ts:1-2`.

### 2.2 Motor de física: Planck.js (Box2D port), no Matter.js

`botsim/src/sim/physics/physics.ts:1` importa `* as Planck from "planck"` — el motor físico es
**Planck.js** (port de Box2D a JS/TS), con `gravity: (0,0)` (mundo top-down, sin gravedad real,
`physics.ts:199`). `Physics.update(dtSecs)` (línea 210-212) avanza `world.step(dtSecs, 6, 2)`
(6 velocity iterations, 2 position iterations).

`PhysicsObject` (líneas 26-169) envuelve un `Planck.Body` por entidad y expone `pos`/`angle`
(getters/setters directos sobre el body), `forward` (línea 34-37, vector unitario a partir de
`body.getAngle()`: `{x: sin(angle), y: -cos(angle)}` — nótese el `-cos`, coherente con "adelante
= -Y en ángulo 0"), y helpers de fixtures (`addShape` soporta `box`, `circle`, `polygon`, `edge`,
`path` — líneas 69-120). También implementa drag-and-drop con mouse vía `MouseJoint`
(líneas 233-263, `mouseDown`/`mouseMove`/`mouseUp`), portado explícitamente de
`microbit-robot/botsim` según el comentario en línea 215-217.

### 2.3 Cómo se construye el cuerpo del robot

`Bot` (`botsim/src/sim/bot/index.ts:22-158`), constructor líneas 45-112:

1. `Chassis.makeShapeSpec(spec)` (`botsim/src/sim/bot/chassis.ts:14-71`) construye el fixture del
   chasis: para `shape: "square"` (el caso de Butia), genera un polígono de 4 vértices con
   colisionador **cuadrado sin chaflán** (línea 43-47: "collider stays a sharp 4-vertex square;
   only the visuals are chamfered") — el `cornerRadius` solo afecta el brush visual
   (`colorBrush.cornerRadius`, línea 57), no la física.
2. Cada `WheelSpec` genera su propio fixture (`Wheel.makeShapeSpec`, `botsim/src/sim/bot/wheel.ts:17-28`).
3. Todo se agrupa en un único `EntitySpec` (`Bot` constructor líneas 57-63) con
   `physics: { ...defaultDynamicPhysics(), linearDamping: 10, angularDamping: 10 }` y se crea vía
   `sim.createEntity(entitySpec)` — es decir, **chasis y ruedas son fixtures del mismo Body**, no
   bodies separados unidos por joints (excepto la fricción, ver abajo).
4. Se agrega un sprite del logo (Pixi) centrado, escalado a `Chassis.footprintWidth(spec) * 0.65`.
5. Por cada `MountSide` en `spec.sensorMounts` (bucle líneas 80-111), y según el modo configurado
   por el usuario (`sensorSettings[side]?.mode`, default `"surface"` si no está configurado), se
   instancian sensores: `GraySensor` (solo si `mode === "surface"`), `LightSensor` (siempre) y o
   bien `SurfaceSensor` o `RangeSensor` para distancia (según `mode`).
6. Las ruedas usan un **`FrictionJoint`** de Planck (`Wheel` constructor, línea 32:
   `bot.entity.physicsObj.addFrictionJoint(spec.pos)`) para simular fricción longitudinal/lateral
   independiente por rueda; `Wheel.update()` (líneas 45-63) separa fricción lateral
   (`updateFriction`, cancela velocidad lateral y amortigua velocidad angular a máx. 10 rad/s) de
   la fuerza de tracción hacia adelante (`updateForce`, línea 82-86: fuerza proporcional a
   `currSpeed * 4.5 * masa`, aplicada en la dirección `bot.forward`).

### 2.4 Visuales del cono de sonar

`botsim/src/sim/rendering/sonarVisuals.ts`:

- `buildSonarVisuals()` (líneas 60-131) construye, por sensor, dos elementos Pixi:
  1. Un **cono/onda** (`Pixi.Graphics`, solo si `showCone === true` — es decir, solo para sensores
     en modo `"forward"`, ver `Bot` constructor línea 89: `showCone = mode === "forward"`):
     dibuja un wedge relleno translúcido (`WAVE_FILL_ALPHA = 0.08`, línea 28) más 3 anillos
     concéntricos animados (`WAVE_RING_COUNT = 3`, ciclo de 2.2s, líneas 26-30) que viajan desde el
     centro hasta `maxRange`, vía `registerTimedRedraw()` (shader/animación por frame).
  2. Un **"target ping"** (cuadrado `PING_RADIUS = 3cm`, línea 16) que se muestra en el punto de
     colisión detectado más cercano, usando un shader propio `sonar_ping` (líneas 32-56) con efecto
     de pulso radial.
- Los colores por tipo de sensor están en `SONAR_COLORS` (líneas 19-24): `range` (violeta),
  `gray` (magenta), `light` (turquesa), `surface` (verde) — elegidos para contrastar contra
  cualquier color de piso/obstáculo de los mapas.
- `updateSonarVisuals()` (líneas 133-151) se llama en cada `read()` de sensor para mover/mostrar
  el "ping" en la posición mundial detectada, transformada a espacio local del bot
  (`Vec2.untransformDeg`).
- El ángulo de apertura (`spec.angle`) y el rango (`spec.maxRange`) que alimentan el cono vienen de
  `sensorSettings` (panel de pines) o de los defaults del tipo de sensor
  (`DEFAULT_RANGE_ANGLE = 30°` / `MAX_RANGE = 400cm` en `rangeSensor.ts:6,8`;
  `DEFAULT_LIGHT_ANGLE` / `LIGHT_MAX_RANGE` en `lightSensor.ts`).
- El fix reciente "center sonar cone on mount" (commit `dde7290`) quitó un nudge `WAVE_OFFSET_X`
  que desplazaba el cono respecto al punto de montaje real.

### 2.5 Panel de configuración de pines/sensores (`pages/PinSettings/`)

Carpeta feature-scoped, organizada internamente por tipo (`components/`, `hooks/`, `model/`,
`state/`, `utils/`), acorde a la regla de organización de `CLAUDE.md`:

- `model/pinAssignment.model.ts`, `model/pinSettingsForm.model.ts` — modelo del formulario
  (asignación de conector J1-J5 por `MountSide`).
- `botSpecs/sensorSettings.model.ts:1-39` — esquema Zod `sensorSettingsSchema`: por mount,
  `mode: "forward" | "surface"` y opcionalmente `angle` (30-90°), `direction` (-45..45°),
  `range` (20-50cm, sobreescribe el máximo default del tipo de sensor). Un mount ausente del
  objeto = "sin configurar" = modo `"surface"` por defecto.
- `state/pinAssignment.slice.ts` y `state/sensorSettings.slice.ts` — Redux Toolkit slices simples
  (`setX`/`clearX`, sin lógica adicional), consumidos por `redux/store.ts` y leídos por
  `useSimulatorLifecycle` (`store.getState().pinAssignment` / `.sensorSettings`) al armar el bot.
- `components/PinSettingsPage.tsx` — UI en español (`"Configuración de sensores"`,
  `"Guardar"`/`"Cancelar"`), panel colapsable (botón `«`/`»`, estado local `isPanelOpen`,
  agregado en el commit "collapsible pin-settings panel").
- `components/SensorMountRow.tsx` — incluye un botón "Restablecer valores" (añadido en `dde7290`)
  que resetea ángulo/dirección/rango a los defaults del mount.
- `hooks/usePinSettingsForm.ts` — lógica de formulario (validación, submit/cancel) usando el
  esquema Zod.

El botón de configuración solo aparece cuando la simulación está armada
(`showSettingsButton={!settingsOpen && armed}`, `botsim/src/App.tsx:11`), gate agregado en el
commit "trim verbose comments and gate settings button on armed state".

---

## 3. Mapas

### 3.1 `mapSpec.ts` — forma de un mapa

`botsim/src/maps/mapSpec.ts:6-14`:

```ts
export type MapSpec = {
    id: number
    name: string
    width: number       // cm
    aspectRatio: number // width / height
    color: string
    spawns: SpawnSpec[]
    entities: EntitySpec[]
}
```

Un mapa es, en esencia, dimensiones + color de fondo + lista de puntos de spawn (`{pos, angle}`)
+ lista de `EntitySpec` (definidas en `botsim/src/sim/entitySpec.ts`, ver sección 4) que
representan pistas, obstáculos, superficies o fuentes de luz.

### 3.2 Los tres mapas concretos y `registry.ts`

`botsim/src/maps/registry.ts:7-15` — `MAP_REGISTRY: Record<number, MapSpec>` mapea `id -> MapSpec`
y expone `resolveMap(id)`. El comentario en línea 6 advierte: **"ids must stay in sync with the
extension's `SimMap` enum"** (el enum vive del lado de la extensión, en bloques que exponen
`Butia.setMap(...)`).

- `defaultMap.ts` (`id: 1`, `"Default"`) — pista cerrada de seguimiento de línea
  (`TRACK_VERTS`, shape `"path"`, rol `"follow-line"`, ancho 3cm, `closed: true`), más dos
  obstáculos dinámicos (`"obstacle"` + `"mouse-target"`, arrastrables con el mouse) de colores
  aleatorios entre `MICROBIT_COLORS`.
- `tableMap.ts` (`id: 2`, `"Mesa"`) — una única entidad `"table-surface"` (rol
  `"table-surface"`, shape `"box"` 60x50cm, `sensor: true`, `density: 0`) que representa el borde
  de una mesa: el robot debe detectar cuándo *deja* de estar sobre la superficie (ver
  `SurfaceSensor`, sección 3.3) para no caerse.
- `lightMap.ts` (`id: 3`, `"Luz"`) — una fuente de luz (`"light-source-1"`, rol
  `"light-source"` + `"mouse-target"`) compuesta de tres shapes superpuestos: una caja invisible
  (collider real, comentario en línea 19: "lightSensor.ts only handles polygon fixtures"), un
  círculo grande con glow (radio 16cm) y un círculo pequeño opaco (radio 4cm) — puramente
  cosmético para simular el halo de luz.

### 3.3 Cómo se carga el mapa en el motor físico y cómo interactúa con los sensores

`Simulation.loadMap(map)` (`botsim/src/sim/index.ts:59-67`): guarda la referencia (`this._map`),
construye 4 paredes estáticas invisibles alrededor del área (`buildWalls()`, líneas 69-94, rol
`"obstacle"`, `density: 0`, con 4cm extra de margen), redimensiona el renderer
(`this._renderer.resize(...)`), fija el color de fondo y crea una `Entity` física+visual por cada
`EntitySpec` del mapa (`createEntity()`, líneas 46-57 — crea el `PhysicsObject` en Planck y el
render object en Pixi en paralelo, ligados por callbacks `() => physicsObj.pos` / `.angle`).

La detección de sensores contra la geometría del mapa depende del **rol** (`roles: string[]`)
tageado en cada fixture, no de a qué mapa pertenece:

- **Distancia (cono, `RangeSensor` / `ConeContactSensor`)** — `botsim/src/sim/bot/sensors/coneContactSensor.ts:96-158`:
  construye un polígono-cono en espacio del sensor (`buildCone()`, líneas 51-80, usando
  `appoximateArc()` de `shared/geometry.ts`), lo transforma a espacio mundial cada `read()`
  (líneas 105-106), recorre los contactos Planck del body del robot, filtra por
  `roles.includes(config.roleTag)` (para `RangeSensor` el tag es `"obstacle"`, `rangeSensor.ts:17`)
  y calcula el punto de intersección más cercano entre los bordes del cono y los bordes del
  fixture detectado (usando `LineSegment.intersectionAll` + `pointInPolygon`), devolviendo la
  distancia en cm o `MAX_RANGE` si no hay nada.
- **Superficie (`SurfaceSensor` / `PointContactSensor`)** — `surfaceSensor.ts:9-17` +
  `pointContactSensor.ts:92-116`: fixture puntual (círculo de radio 0.5cm) que reporta
  `SURFACE_ON_VALUE = 5` mientras está en contacto con un fixture de rol `"table-surface"`
  (el mismo rol que usa `tableMap.ts`), o `MAX_RANGE` (= "cayéndose") si deja de solaparse. Esto
  es exactamente el mecanismo usado por el script de ejemplo `codigos/caer_mesa_atras.js`
  (fuera de `botsim/`, en la raíz del repo) para hacer que el robot retroceda al detectar el
  borde de la mesa — el commit `dde7290` corrigió ese script porque los handlers de J1/J2 tenían
  adelante/atrás invertidos.
- **Línea/gris (`GraySensor`)** — misma clase `PointContactSensor`, rol `"follow-line"` (el que
  usa `defaultMap.ts`'s `TRACK_VERTS`).
- **Luz (`LightSensor`)** — cono igual que `RangeSensor` pero con rol `"light-source"` (el que usa
  `lightMap.ts`) y su propia función `mapDistance` (atenúa según distancia en vez de devolver la
  distancia cruda).

En todos los casos, el resultado de `read()` alimenta directamente `Bot.readSensors()`
(`bot/index.ts:132-146`), que es lo que finalmente viaja de vuelta a la extensión como mensaje
`sensors` (sección 1.3c).

---

## 4. Arquitectura general de la app `botsim/`

### 4.1 Estructura de carpetas de nivel superior (`botsim/src/`)

Organización por responsabilidad, siguiendo la regla de `CLAUDE.md` (global/compartido en
carpetas top-level, feature-scoped anidado en su propia carpeta):

| Carpeta | Responsabilidad |
|---|---|
| `sim/` | Motor de simulación en sí: física (Planck), render (Pixi), entidades, el `Bot` y sus sensores, el singleton `Simulation`. Código de dominio, sin React. |
| `simulatorBridge/` | Protocolo de mensajes con la extensión PXT (`protocol.ts`), listener de `window.postMessage` (`makecodeService.ts`) y el hook de ciclo de vida que conecta ambos con `Simulation` (`useSimulatorLifecycle.ts`). |
| `botSpecs/` | Specs de robot reutilizables entre features: tipos (`botSpec.ts`), la instancia concreta `butiaBotSpec.ts`, `mountSide.ts`, `connectorSlot.ts`, `sensorSettings.model.ts` (schema Zod compartido por el panel de settings y por `Bot`). |
| `maps/` | Specs de mapas (`mapSpec.ts`, `defaultMap.ts`, `tableMap.ts`, `lightMap.ts`) y el registro (`registry.ts`). |
| `shared/` | Utilidades/tipos genéricos usados por más de una feature: `types/vec2.ts`, `types/line.ts`, `types/aabb.ts`, `geometry.ts`, `constants.ts`, `util.ts`, `hooks/useIsFullscreenSim.ts`. |
| `pages/` | Vistas de nivel de app: `SimContainer.tsx` (monta el canvas de la simulación), `Placeholder.tsx` (estado "sin armar"), `PinSettings/` (feature completa, organizada internamente por tipo — ver 2.5). |
| `layout/` | Chrome de la app: `Layout.tsx`, `CloseBtn.tsx`, `FullscreenPrompt.tsx`. |
| `context/` | `botsim.context.tsx` — contexto de React que expone `armed`/`rearmOnSettingsClose`/`settingsOpen` a toda la app, construido sobre `useSimulatorLifecycle`. |
| `redux/` | `store.ts` — configura el store con los slices de `pinAssignment` y `sensorSettings`. |

### 4.2 Cómo arranca la app

1. `botsim/src/index.tsx:9-18` — `createRoot(root).render(<StrictMode><Provider store={store}><BotSimContextProvider><App/></BotSimContextProvider></Provider></StrictMode>)`.
2. `BotSimContextProvider` (`botsim/src/context/botsim.context.tsx:18-27`) invoca
   `useSimulatorLifecycle()` inmediatamente al montar — esto es lo que registra el listener
   `window.addEventListener("message", ...)` (`makecodeService.init`, dentro de un `useEffect`,
   `useSimulatorLifecycle.ts:40-105`) y deja la app **esperando** el primer mensaje `mapselect`
   de la extensión antes de instanciar nada del mundo físico.
3. `App.tsx:7-27` decide qué renderizar según el estado del contexto: `settingsOpen` →
   `<PinSettings/>`; si no, `armed` → `<SimContainer/>`; si no, `<Placeholder/>` (pantalla inicial,
   sin simulación corriendo).
4. `Simulation` es un **singleton lazy** (`Simulation.instance`, `botsim/src/sim/index.ts:40-44`):
   se instancia recién la primera vez que algo llama `.instance` (constructor privado, línea 33-38)
   — crea `Physics` (mundo Planck vacío), `Renderer` (Pixi, init async — `this.ready` es la
   promise que hay que esperar antes de tocar el renderer, comentario línea 30) e `InputController`.
5. Cuando llega el primer `mapselect` válido, `handleMapSelect()`
   (`useSimulatorLifecycle.ts:53-69`) espera `sim.ready`, y recién ahí:
   `sim.loadMap(mapSpec)` (construye paredes + entidades del mapa en Planck/Pixi, sección 3.3) →
   `sim.spawnBot(BUTIA_BOT_SPEC, undefined, ports, sensorSettings)` (crea el `Bot`, sección 2.3) →
   `sim.start()` (arranca el loop `requestAnimationFrame`, `Simulation.loop`,
   `botsim/src/sim/index.ts:157-171`, que corre física a 60Hz fijo y render a la tasa del monitor).
6. `SimContainer.tsx` (`botsim/src/pages/SimContainer.tsx`) monta el `<canvas>` de Pixi
   (`Simulation.instance.mountTo(el)`) y reenvía eventos de mouse (`mousedown`/`mousemove`/`mouseup`)
   a `Simulation` para el drag-and-drop de obstáculos (`InputController`,
   `botsim/src/sim/inputController.ts`, no detallado arriba pero delega en
   `Physics.mouseDown/mouseMove/mouseUp`).
