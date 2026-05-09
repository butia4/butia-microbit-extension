// PXT does not support `abstract class` — this DI base class is the approved substitute.

namespace Butia {
    export class RobotBase implements IRobot {
        // --- Fields ---
        private _motors: IMotorDriver;
        private _lights: {pin:AnalogPin | DigitalPin, sensor: ILightSensor}[];
        private _grays: {pin:AnalogPin | DigitalPin, sensor: IGraySensor}[];
        private _distances: {pin:AnalogPin | DigitalPin, sensor: IDistanceSensor}[];
        private _connectorConfig: IConnectorPin[];
        private _motorLeft: number;
        private _motorRight: number;
        private _pinUsage: { pin: AnalogPin | DigitalPin; type: string }[];
        // --- Constructor ---
        constructor(
            motors: IMotorDriver,
            connectorConfig: IConnectorPin[]
        ) {
            this._motors = motors;
            this._connectorConfig = connectorConfig;
            this._lights = [];
            this._grays = [];
            this._distances = [];
            this._motorLeft = 0;
            this._motorRight = 0;
            this._pinUsage = [];
        }

        // --- Private helpers ---
         private _resolvePin(connector: IConnector): AnalogPin|DigitalPin {
            for (const cp of this._connectorConfig) {
                if (cp.connector.name === connector.name) return cp.pin;
            }
            control.fail("Conector " + connector.name + " no encontrado.");
            return 0 as AnalogPin;
        }
        private _claimPin(pin: AnalogPin | DigitalPin, type: string): void {
          
            let valid = false;
            for (const cp of this._connectorConfig) {
                if (cp.pin === pin) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                control.fail("Pin " + pin + " no pertenece a ningún conector configurado.");
            }

            for (const entry of this._pinUsage) {
                if (entry.pin === pin) {
                    if (entry.type !== type) {
                        control.fail("Pin " + pin + " ya está en uso como " + entry.type);
                    }
                    return;
                }
            }
            this._pinUsage.push({ pin, type });
        }

        private _getLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
    
            for (const entry of this._lights) {
                if (entry.pin === pin) {
                    return entry.sensor;
                }
            }
            this._claimPin(pin, "light")
            const sensor = new LightSensor(pin);
            this._lights.push({ pin, sensor });
            return sensor;
        }

        private _getGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
            for (const entry of this._grays) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "gray")
            const sensor = new GraySensor(pin);
            this._grays.push({ pin, sensor });
            return sensor;
        }

        private _getDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
            for (const entry of this._distances) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "distance")
            const sensor = new DistanceSensor(pin);
            this._distances.push({ pin, sensor });
            return sensor;
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
            const s = this._getDistanceSensor(this._resolvePin(connector));
            return s.read();
        }

        readLightSensor(connector: IConnector): number {
            const s = this._getLightSensor(this._resolvePin(connector));
            return s.read();
        }

        readGraySensor(connector: IConnector): number {
            const s = this._getGraySensor(this._resolvePin(connector));
            return s.read();
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
