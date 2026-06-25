// Sends a state message to the botsim via simmessages. TD_NOOP so the call
// is a no-op on hardware — control.simmessages.send is simulator-only.
//% shim=TD_NOOP
function _butiaSimSend(msg: string): void {
    control.simmessages.send("butia", Buffer.fromUTF8(msg), false);
}

// Builds the JSON state message sent from PXT to the botsim.
// Exposed as a pure function so tests can verify message structure directly.
function buildButiaStateMessage(left: number, right: number, sensors: { [k: string]: string }, runId: string): string {
    return JSON.stringify({
        type: "state",
        id: runId,
        motorLeft: left,
        motorRight: right,
        sensors: sensors
    });
}

class SimMotorDriver implements IMotorDriver {
    private _getSensorTypes: () => { [connName: string]: string };

    constructor(getSensorTypes: () => { [connName: string]: string }) {
        this._getSensorTypes = getSensorTypes;
    }

    init(): void {}

    setSpeed(left: number, right: number): void {
        SimState.sensorTypeMap = this._getSensorTypes();
        const msg = buildButiaStateMessage(left, right, SimState.sensorTypeMap, SimState.runId);
        _butiaSimSend(msg);
    }

    stop(): void {
        this.setSpeed(0, 0);
    }
}
