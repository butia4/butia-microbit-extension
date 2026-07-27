interface SimSensorEntry {
    connName: string;
    type: string;
}

// Top-level TD_NOOP function — PXT replaces this with a no-op on hardware.
// In the browser simulator the body executes, registering the incoming sensor
// message handler. Using `any` for the data parameter avoids Buffer.toString()
// type issues while still working correctly in the sim's JS runtime.
//% shim=TD_NOOP
function _butiaSimInit(getSensorTypes: () => { [connName: string]: string }): void {
    SimState.reset();
    SimState.runId = "" + Math.random();
    control.simmessages.onReceived("butia4/butia-microbit-extension", (data: Buffer) => {
        applyButiaSensorsMessage(data.toString());
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
            SimState.sensorTypeMap = getSensorTypes();
            const msg = buildButiaStateMessage(SimState.motorLeft, SimState.motorRight, SimState.sensorTypeMap, SimState.runId);
            _butiaSimSend(msg);
            if (SimState.selectedMapId !== 0) {
                _butiaSimSend(buildButiaMapSelectMessage(SimState.selectedMapId));
            }
            basic.pause(50);
        }
    });
}

// Swaps the hardware robot for ButiaSimRobot when running in the PXT simulator.
// TD_NOOP ensures this is a no-op on physical hardware.
//% shim=TD_NOOP
function _registerButiaSimRobot(driver: Butia.RobotDriver): void {
    driver._setSimRobot(new Butia.ButiaSimRobot());
}

namespace Butia {
    export class ButiaSimRobot extends RobotBase {
        private _simSensors: SimSensorEntry[];

        constructor() {
            const selfRef: Butia.ButiaSimRobot[] = [];
            const driver = new SimMotorDriver(() => {
                if (selfRef.length > 0) return selfRef[0]._buildSensorTypeMap();
                return {};
            });
            super(
                driver,
                [
                    new ConnectorPin(J1, AnalogPin.P1),
                    new ConnectorPin(J2, AnalogPin.P2),
                    new ConnectorPin(J3, AnalogPin.P3),
                    new ConnectorPin(J4, AnalogPin.P4),
                    new ConnectorPin(J5, AnalogPin.P10),
                ]
            );
            selfRef[0] = this;
            this._simSensors = [];
        }

        start(): void {
            _butiaSimInit(() => this._buildSensorTypeMap());
            super.start();
        }

        protected _newDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
            const s = new SimDistanceSensor(this._pinToConnName(pin), pin);
            this._simSensors.push({ connName: s.getConnName(), type: s.getSensorType() });
            return s;
        }

        protected _newGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
            const s = new SimGraySensor(this._pinToConnName(pin), pin);
            this._simSensors.push({ connName: s.getConnName(), type: s.getSensorType() });
            return s;
        }

        protected _newLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
            const s = new SimLightSensor(this._pinToConnName(pin), pin);
            this._simSensors.push({ connName: s.getConnName(), type: s.getSensorType() });
            return s;
        }

        protected _newButtonSensor(pin: AnalogPin | DigitalPin): IButtonSensor {
            const s = new SimButtonSensor(this._pinToConnName(pin), pin);
            this._simSensors.push({ connName: s.getConnName(), type: s.getSensorType() });
            return s;
        }

        private _pinToConnName(pin: AnalogPin | DigitalPin): string {
            const cfg = this._getConnectorConfig();
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
