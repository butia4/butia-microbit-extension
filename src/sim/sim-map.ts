// Records the selected map and left/right port assignment for the run,
// once. TD_NOOP so the call is a no-op on hardware. The actual mapselect
// message is sent (and resent) by the background loop in _butiaSimInit —
// see sim-state.ts's selectedMapId comment for why a one-shot send isn't
// reliable. Both ports are mandatory — no default/fallback value anywhere
// in this call chain (block decorator -> here -> wire protocol).
//% shim=TD_NOOP
function _butiaSimSelectMap(id: number, leftPort: string, rightPort: string): void {
    if (SimState.mapSelected) return;
    SimState.mapSelected = true;
    SimState.selectedMapId = id;
    SimState.selectedLeftPort = leftPort;
    SimState.selectedRightPort = rightPort;
}

// Builds the JSON mapselect message sent from PXT to the botsim.
// Exposed as a pure function so tests can verify message structure directly.
function buildButiaMapSelectMessage(id: number, leftPort: string, rightPort: string): string {
    return JSON.stringify({
        type: "mapselect",
        id: id,
        leftPort: leftPort,
        rightPort: rightPort
    });
}
