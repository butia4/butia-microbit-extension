namespace butia {
    // Sends a state message to the botsim via simmessages. TD_NOOP so the call
    // is a no-op on hardware — control.simmessages.send is simulator-only.
    //% shim=TD_NOOP
    export function _simSend(msg: string): void {
        control.simmessages.send("butia4/butia-microbit-extension", Buffer.fromUTF8(msg), false);
    }

    // Builds the JSON state message sent from PXT to the botsim.
    // Exposed as a pure function so tests can verify message structure directly.
    // `model` is optional and additive: omitted/absent JSON keys let older
    // botsim builds keep defaulting to the v4 layout (see design's
    // Migration/Rollout note).
    export function buildStateMessage(left: number, right: number, sensors: { [k: string]: string }, runId: string, model?: string): string {
        return JSON.stringify({
            type: "state",
            id: runId,
            motorLeft: left,
            motorRight: right,
            sensors: sensors,
            model: model
        });
    }

    export class SimMotorDriver implements IMotorDriver {
        private _sensorTypes: () => { [connName: string]: string };

        constructor(sensorTypes: () => { [connName: string]: string }) {
            this._sensorTypes = sensorTypes;
        }

        init(): void {}

        setSpeed(left: number, right: number): void {
            simState.motorLeft = left;
            simState.motorRight = right;
            simState.sensorTypeMap = this._sensorTypes();
            const msg = buildStateMessage(left, right, simState.sensorTypeMap, simState.runId, simState.robotModelId);
            _simSend(msg);
        }

        stop(): void {
            this.setSpeed(0, 0);
        }
    }
}
