namespace butia {
    // Records the selected map for the run, once. TD_NOOP so the call is a
    // no-op on hardware. The actual mapselect message is sent (and resent) by
    // the background loop in _simInit — see sim-state.ts's selectedMapId
    // comment for why a one-shot send isn't reliable. Port<->mount assignment
    // is configured entirely in the botsim settings screen, not here.
    //% shim=TD_NOOP
    export function _simSelectMap(id: number): void {
        if (simState.mapSelected) return;
        simState.mapSelected = true;
        simState.selectedMapId = id;
    }

    // Builds the JSON mapselect message sent from PXT to the botsim.
    // Exposed as a pure function so tests can verify message structure directly.
    export function buildMapSelectMessage(id: number): string {
        return JSON.stringify({
            type: "mapselect",
            id: id
        });
    }
}
