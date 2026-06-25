namespace SimState {
    export let runId: string = "";
    export let sensorCache: { [connName: string]: number } = {};
    export let sensorTypeMap: { [connName: string]: string } = {};

    export function reset(): void {
        runId = "";
        sensorCache = {};
        sensorTypeMap = {};
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
