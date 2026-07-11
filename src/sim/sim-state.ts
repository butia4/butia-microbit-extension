namespace SimState {
    export let runId: string = "";
    export let sensorCache: { [connName: string]: number } = {};
    export let sensorTypeMap: { [connName: string]: string } = {};
    export let motorLeft: number = 0;
    export let motorRight: number = 0;
    export let mapSelected: boolean = false;
    // 0 = unset sentinel, matches SimMap's wire protocol. Kept resent every
    // tick by the background loop in _butiaSimInit (see sim-robot.ts) instead
    // of being sent once, since a one-shot send can race the botsim iframe's
    // mount and get silently dropped by postMessage (no queue/replay).
    export let selectedMapId: number = 0;
    // "" = unset sentinel. Set once (alongside selectedMapId) by
    // _butiaSimSelectMap and resent every tick by the same background loop.
    export let selectedLeftPort: string = "";
    export let selectedRightPort: string = "";

    export function reset(): void {
        runId = "";
        sensorCache = {};
        sensorTypeMap = {};
        motorLeft = 0;
        motorRight = 0;
        mapSelected = false;
        selectedMapId = 0;
        selectedLeftPort = "";
        selectedRightPort = "";
    }
}

// Parses an incoming sensors message and updates SimState.sensorCache.
// Exposed as a free function so tests can call it directly without needing
// control.simmessages loopback.
function applyButiaSensorsMessage(raw: string): void {
    const msg = JSON.parse(raw);
    if (!msg || msg.type !== "sensors" || msg.id !== SimState.runId) return;
    const values = msg.values as { [k: string]: number };
    for (const k of Object.keys(values)) {
        SimState.sensorCache[k] = values[k];
    }
}
