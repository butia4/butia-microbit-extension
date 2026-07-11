// Records the selected map for the run, once. TD_NOOP so the call is a
// no-op on hardware. The actual mapselect message is sent (and resent) by
// the background loop in _butiaSimInit — see sim-state.ts's selectedMapId
// comment for why a one-shot send isn't reliable.
//% shim=TD_NOOP
function _butiaSimSelectMap(id: number): void {
    if (SimState.mapSelected) return;
    SimState.mapSelected = true;
    SimState.selectedMapId = id;
}

// Builds the JSON mapselect message sent from PXT to the botsim.
// Exposed as a pure function so tests can verify message structure directly.
function buildButiaMapSelectMessage(id: number): string {
    return JSON.stringify({
        type: "mapselect",
        id: id
    });
}
