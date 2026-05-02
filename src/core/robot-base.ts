// PXT does not support `abstract class` — this DI base class is the approved substitute.

namespace Butia {
    export class RobotBase implements IRobot {
        // --- Fields ---
        private _motors: IMotorDriver;
        private _lights: ILightSensor[];
        private _grays: IGraySensor[];
        private _distances: IDistanceSensor[];
        private _connectorConfig: IConnectorPin[];
        private _motorLeft: number;
        private _motorRight: number;

        // --- Constructor ---
        constructor(
            motors: IMotorDriver,
            connectorConfig: IConnectorPin[],
            distance: IDistanceSensor[],
            light: ILightSensor[],
            gray: IGraySensor[]
        ) {
            this._motors = motors;
            this._connectorConfig = connectorConfig;
            this._distances = distance;
            this._lights = light;
            this._grays = gray;
            this._motorLeft = 0;
            this._motorRight = 0;
        }

        // --- Private helpers ---
        private _resolvePin(connector: IConnector): AnalogPin {
            for (const cp of this._connectorConfig) {
                if (cp.connector.name === connector.name) return cp.pin;
            }
            control.fail("Conector " + connector.name + " no encontrado.");
            return 0 as AnalogPin;
        }

        private _findLightSensor(pin: AnalogPin): ILightSensor | null {
            for (const sensor of this._lights) {
                if (sensor.getPin() === pin) return sensor;
            }
            control.fail("No light sensor found for pin " + pin);
            return null;
        }

        private _findGraySensor(pin: AnalogPin): IGraySensor | null {
            for (const sensor of this._grays) {
                if (sensor.getPin() === pin) return sensor;
            }
            control.fail("No gray sensor found for pin " + pin);
            return null;
        }

        private _findDistanceSensor(pin: AnalogPin): IDistanceSensor | null {
            for (const sensor of this._distances) {
                if (sensor.getPin() === pin) return sensor;
            }
            control.fail("No distance sensor found for pin " + pin);
            return null;
        }

        private _setMotorSpeed(left: number, right: number): void {
            this._motorLeft = left;
            this._motorRight = right;
            this._motors.setSpeed(left, right);
        }

        // --- Movement ---
        moveForward(speed: number, duration?: number): void {
            this._setMotorSpeed(speed, speed);
            if (duration) {
                basic.pause(duration);
                this._setMotorSpeed(0, 0);
            }
        }

        moveBackward(speed: number = 70, duration?: number): void {
            this._setMotorSpeed(-speed, -speed);
            if (duration !== undefined) {
                basic.pause(duration);
                this._setMotorSpeed(0, 0);
            }
        }

        turn(direction: TurnDirection, speed: number = 60, duration?: number): void {
            if (direction === TurnDirection.Left) {
                this._setMotorSpeed(-speed, speed);
            } else {
                this._setMotorSpeed(speed, -speed);
            }
            if (duration !== undefined) {
                basic.pause(duration);
                this._setMotorSpeed(0, 0);
            }
        }

        motorTank(left: number, right: number): void {
            this._setMotorSpeed(left, right);
        }

        motorStop(): void {
            this._setMotorSpeed(0, 0);
        }

        // --- Sensors ---
        readDistanceSensor(connector: IConnector): number {
            const s = this._findDistanceSensor(this._resolvePin(connector));
            return s ? s.read() : 0;
        }

        readLightSensor(connector: IConnector): number {
            const s = this._findLightSensor(this._resolvePin(connector));
            return s ? s.read() : 0;
        }

        readGraySensor(connector: IConnector): number {
            const s = this._findGraySensor(this._resolvePin(connector));
            return s ? s.read() : 0;
        }

        // --- Events ---
        onLevelReached(sensor: number, pin: number, handler: () => void): void {
            control.onEvent(3194, sensor * 1000 + pin * 100 + 1, handler);
        }

        onLevelUnreached(sensor: number, pin: number, handler: () => void): void {
            control.onEvent(3194, sensor * 1000 + pin * 100, handler);
        }

        onButton(pin: number, handler: () => void): void {
            control.onEvent(3194, 3 * 1000 + pin * 100 + 1, handler);
        }

        // --- Getters ---
        public motorLeft(): number { return this._motorLeft; }
        public motorRight(): number { return this._motorRight; }

        // --- Overridable stubs ---
        start(): void {}

        setSimDrivers(_line: ILineSensor, _distance: IDistanceSensor): void {
            control.fail("Method not implemented");
        }

        setAssist(_flag: RobotAssist, _enabled: boolean): void {
            control.fail("Method not implemented");
        }

        readButton(_connector: IConnector): boolean {
            control.fail("Method not implemented");
            return false;
        }

        startMonitoring(_sensor: number, _pin: number, _threshold: number): void {
            control.fail("Method not implemented");
        }

        startMonitoringButton(_pin: number): void {
            control.fail("Method not implemented");
        }
    }
}
