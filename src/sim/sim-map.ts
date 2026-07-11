// Sends a mapselect message to the botsim via simmessages, once per run.
// TD_NOOP so the call is a no-op on hardware — control.simmessages.send is
// simulator-only. Idempotent: only the first call sends a message.
//% shim=TD_NOOP
function _butiaSimSelectMap(id: number): void {
    if (SimState.mapSelected) return;
    SimState.mapSelected = true;
    const msg = buildButiaMapSelectMessage(id);
    _butiaSimSend(msg);
}

// Builds the JSON mapselect message sent from PXT to the botsim.
// Exposed as a pure function so tests can verify message structure directly.
function buildButiaMapSelectMessage(id: number): string {
    return JSON.stringify({
        type: "mapselect",
        id: id
    });
}
