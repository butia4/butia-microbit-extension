namespace butia {
    export interface SimSensorEntry {
        connName: string;
        type: string;
    }

    // TD_NOOP function — PXT replaces this with a no-op on hardware.
    // In the browser simulator the body executes, registering the incoming sensor
    // message handler. Using `any` for the data parameter avoids Buffer.toString()
    // type issues while still working correctly in the sim's JS runtime.
    //% shim=TD_NOOP
    export function _simInit(sensorTypes: () => { [connName: string]: string }): void {
        simState.reset();
        simState.runId = "" + Math.random();
        control.simmessages.onReceived("butia4/butia-microbit-extension", (data: Buffer) => {
            applySensorsMessage(data.toString());
        });
        // Background loop: keeps the botsim iframe alive by sending state continuously,
        // even when no motor blocks are active. Matches microbit-robot's sendSim() pattern.
        // Also resends mapselect every tick (once one is selected) instead of just
        // once, since a one-shot send can race the botsim iframe's mount and be
        // silently dropped by postMessage — see sim-state.ts's selectedMapId comment.
        //
        // sensorTypeMap is rebuilt here every tick (not just inside
        // SimMotorDriver.setSpeed()) to avoid a startup deadlock: a program that
        // only registers onDistance/onGray/onLight handlers — and never calls an
        // unconditional motor command — would otherwise never send its active
        // sensors to botsim, so onDistance's `read() <= 0` guard would never see
        // a real value and the handler would never fire.
        control.inBackground(() => {
            while (true) {
                simState.sensorTypeMap = sensorTypes();
                const msg = buildStateMessage(simState.motorLeft, simState.motorRight, simState.sensorTypeMap, simState.runId, simState.robotModelId);
                _simSend(msg);
                if (simState.selectedMapId !== 0) {
                    _simSend(buildMapSelectMessage(simState.selectedMapId));
                }
                basic.pause(50);
            }
        });
    }

    // Swaps the hardware robot for ButiaSimRobot when running in the PXT simulator.
    // TD_NOOP ensures this is a no-op on physical hardware.
    //% shim=TD_NOOP
    export function _registerSimRobot(driver: RobotDriver): void {
        driver._setSimRobot(new ButiaSimRobot(driver._connectorConfig(), driver._modelId()));
    }

    // v2's connector layout — used as ButiaSimRobot's default so pre-existing
    // callers that construct it with no arguments (tests, mainly) keep working.
    function _defaultSimConnectorConfig(): IConnectorPin[] {
        return [
            new ConnectorPin(v2.J1, AnalogPin.P1),
            new ConnectorPin(v2.J2, AnalogPin.P2),
            new ConnectorPin(v2.J3, AnalogPin.P3),
            new ConnectorPin(v2.J4, AnalogPin.P4),
            new ConnectorPin(v2.J5, AnalogPin.P10),
        ];
    }

    export class ButiaSimRobot extends RobotBase {
        private _simSensors: SimSensorEntry[];

        // connectorConfig/modelId are optional (defaulting to v4) rather than
        // using default-value syntax, because PXT's compiler (TS9212) only
        // supports numeric/null/true/false literal defaults — see robot-base.ts.
        constructor(connectorConfig?: IConnectorPin[], modelId?: string) {
            const selfRef: ButiaSimRobot[] = [];
            const driver = new SimMotorDriver(() => {
                if (selfRef.length > 0) return selfRef[0]._buildSensorTypeMap();
                return {};
            });
            super(
                driver,
                connectorConfig ? connectorConfig : _defaultSimConnectorConfig(),
                modelId ? modelId : "butiaV2"
            );
            selfRef[0] = this;
            this._simSensors = [];
        }

        start(): void {
            _simInit(() => this._buildSensorTypeMap());
            simState.robotModelId = this.modelId();
            super.start();
        }

        protected _newDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
            const s = new SimDistanceSensor(this._pinToConnName(pin));
            this._simSensors.push({ connName: s.connectorName(), type: s.sensorType() });
            return s;
        }

        protected _newGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
            const s = new SimGraySensor(this._pinToConnName(pin));
            this._simSensors.push({ connName: s.connectorName(), type: s.sensorType() });
            return s;
        }

        protected _newLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
            const s = new SimLightSensor(this._pinToConnName(pin));
            this._simSensors.push({ connName: s.connectorName(), type: s.sensorType() });
            return s;
        }

        protected _newButtonSensor(pin: AnalogPin | DigitalPin): IButtonSensor {
            const s = new SimButtonSensor(this._pinToConnName(pin));
            this._simSensors.push({ connName: s.connectorName(), type: s.sensorType() });
            return s;
        }

        private _pinToConnName(pin: AnalogPin | DigitalPin): string {
            const cfg = this._connectorConfig;
            for (const cp of cfg) {
                if (cp.pin === pin) return cp.connector.name;
            }
            return "UNKNOWN";
        }

        _buildSensorTypeMap(): { [connName: string]: string } {
            const result: { [connName: string]: string } = {};
            for (const e of this._simSensors) {
                result[e.connName] = e.type;
            }
            return result;
        }
    }
}
