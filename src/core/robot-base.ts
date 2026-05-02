// PXT does not support `abstract class` — this DI base class is the approved substitute.

namespace Butia {
    export class RobotBase implements IRobot {
        protected _motors: IMotorDriver;
        protected _lights: ILightSensor[];
        protected _grays: IGraySensor[];
        protected _distances: IDistanceSensor[];
        protected _assistFlags: number;
        protected connectorConfig:{ [key: string]: AnalogPin };
        _motorLeft: number = 0;
        _motorRight: number = 0;

        constructor(motors: IMotorDriver, connectorConfig: { [key: string]: AnalogPin }, distance: IDistanceSensor[], light: ILightSensor[], gray: IGraySensor[]) {
            this._motors = motors;
            this._distances = distance;
            this._lights = light;
            this._grays = gray;
            this.connectorConfig = connectorConfig;
            this._assistFlags = 0;
        }
        private _resolvePin(pin: string): AnalogPin {
            const resolved = this.connectorConfig[pin];
            if (resolved === undefined) {
                const available = Object.keys(this.connectorConfig).join(", ");
                control.fail("Pin " + pin + " not found. Available: " + available);
            }
            return resolved;
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
        protected _setMotorSpeed(left: number, right: number): void {
            this._motorLeft = left;
            this._motorRight = right;
            this._motors.setSpeed(left, right);
        }
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
        readDistanceSensor(pin: string): number {
            const s = this._findDistanceSensor(this._resolvePin(pin));
            return s ? s.read() : 0;
        }
        readLightSensor(pin: string): number {
            const s = this._findLightSensor(this._resolvePin(pin));
            return s ? s.read() : 0;
        }
        readGraySensor(pin: string): number {
            const s = this._findGraySensor(this._resolvePin(pin));
            return s ? s.read() : 0;
        }

        start(): void {}
        setSimDrivers(line: ILineSensor, distance: IDistanceSensor): void {
            control.fail("Method not implemented");
        }
        setAssist(flag: RobotAssist, enabled: boolean): void {
            control.fail("Method not implemented");
        }
        readButton(pin: string): boolean {
            control.fail("Method not implemented");
            return false;
        }
        startMonitoring(sensor: number, pin: number, threshold: number): void {
            control.fail("Method not implemented");
        }

        onLevelReached(sensor: number, pin: number, handler: () => void): void {
            control.onEvent(3194, sensor * 1000 + pin * 100 + 1, handler);
        }

        onLevelUnreached(sensor: number, pin: number, handler: () => void): void {
            control.onEvent(3194, sensor * 1000 + pin * 100, handler);
        }

        startMonitoringButton(pin: number): void {
            control.fail("Method not implemented");
        }

        onButton(pin: number, handler: () => void): void {
            control.onEvent(3194, 3 * 1000 + pin * 100 + 1, handler);
        }
    }
}

