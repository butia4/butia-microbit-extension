// PXT does not support `abstract class` — this DI base class is the approved substitute.

namespace Butia {
    export class RobotBase implements IRobot {
        // --- Fields ---
        private _motors: IMotorDriver;
        private _lights: {pin:AnalogPin | DigitalPin, sensor: ILightSensor}[];
        private _grays: {pin:AnalogPin | DigitalPin, sensor: IGraySensor}[];
        private _distances: {pin:AnalogPin | DigitalPin, sensor: IDistanceSensor}[];
        private _buttons: {pin:AnalogPin | DigitalPin, sensor: IButtonSensor}[];
        private _connectorConfig: IConnectorPin[];
        private _motorLeft: number;
        private _motorRight: number;
        private _pinUsage: { pin: AnalogPin | DigitalPin; type: string }[];
        private _eventMonitor: EventMonitor;
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
            this._buttons = [];
            this._motorLeft = 0;
            this._motorRight = 0;
            this._pinUsage = [];
            this._eventMonitor = this._newEventMonitor();
        }

        // Overridable factory — tests use this to inject a monitor that
        // doesn't auto-start the background fiber.
        protected _newEventMonitor(): EventMonitor { return new EventMonitor(); }

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

        // --- Sensor factories (overridable for testing) ---
        protected _newLightSensor(pin: AnalogPin | DigitalPin): ILightSensor { return new LightSensor(pin); }
        protected _newGraySensor(pin: AnalogPin | DigitalPin): IGraySensor { return new GraySensor(pin); }
        protected _newDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor { return new DistanceSensor(pin); }
        protected _newButtonSensor(pin: AnalogPin | DigitalPin): IButtonSensor { return new ButtonSensor(pin as DigitalPin); }

        private _getLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
            for (const entry of this._lights) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "light");
            const sensor = this._newLightSensor(pin);
            this._lights.push({ pin, sensor });
            return sensor;
        }

        private _getGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
            for (const entry of this._grays) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "gray");
            const sensor = this._newGraySensor(pin);
            this._grays.push({ pin, sensor });
            return sensor;
        }

        private _getDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
            for (const entry of this._distances) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "distance");
            const sensor = this._newDistanceSensor(pin);
            this._distances.push({ pin, sensor });
            return sensor;
        }

        private _getButtonSensor(pin: AnalogPin | DigitalPin): IButtonSensor {
            for (const entry of this._buttons) {
                if (entry.pin === pin) return entry.sensor;
            }
            this._claimPin(pin, "button");
            const sensor = this._newButtonSensor(pin);
            this._buttons.push({ pin, sensor });
            return sensor;
        }

        private _setMotorSpeed(left: number, right: number): void {
            this._motorLeft = left;
            this._motorRight = right;
            this._motors.setSpeed(left, right);
        }

        // --- Movement ---
        moveForward(speed: number, duration: number): void {
            this._setMotorSpeed(speed, speed);
            if (duration!==0) {
                basic.pause(duration);
                this._setMotorSpeed(0, 0);
            }
        }

        moveBackward(speed: number = 70, duration: number): void {
            this._setMotorSpeed(-speed, -speed);
            if (duration !== 0) {
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

        readButton(connector: IConnector): boolean {
            const s = this._getButtonSensor(this._resolvePin(connector));
            return s.read() === 1;
        }

        // --- Events ---
        
        onDistance(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void {
            const pin = this._resolvePin(connector);
            const sensor = this._getDistanceSensor(pin);
            const subId = computeSubId(SENSOR_TYPE_DISTANCE, pin as number, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => {
                    const d = sensor.read();
                    if (d <= 0) return false;
                    return evalComparison(op, d, threshold);
                },
                lastTriggered: false
            };
            control.onEvent(BUTIA_EVENT_ID, subId, handler);
            this._eventMonitor.register(monitor);
        }

        onLight(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void {
            const pin = this._resolvePin(connector);
            const sensor = this._getLightSensor(pin);
            const subId = computeSubId(SENSOR_TYPE_LIGHT, pin as number, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => evalComparison(op, sensor.read(), threshold),
                lastTriggered: false
            };
            control.onEvent(BUTIA_EVENT_ID, subId, handler);
            this._eventMonitor.register(monitor);
        }

        onGray(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void {
            const pin = this._resolvePin(connector);
            const sensor = this._getGraySensor(pin);
            const subId = computeSubId(SENSOR_TYPE_GRAY, pin as number, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => evalComparison(op, sensor.read(), threshold),
                lastTriggered: false
            };
            control.onEvent(BUTIA_EVENT_ID, subId, handler);
            this._eventMonitor.register(monitor);
        }

        onConnectorButton(connector: IConnector, state: ButtonState, handler: () => void): void {
            const pin = this._resolvePin(connector);
            const sensor = this._getButtonSensor(pin);
            const dir = state === ButtonState.Pressed ? DIR_GREATER_OR_PRESSED : DIR_LESS_OR_RELEASED;
            const subId = computeSubId(SENSOR_TYPE_BUTTON, pin as number, dir);
            const target = state === ButtonState.Pressed ? 1 : 0;
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => sensor.read() === target,
                lastTriggered: false
            };
            control.onEvent(BUTIA_EVENT_ID, subId, handler);
            this._eventMonitor.register(monitor);
        }

        // --- Reactive (Mientras) motor rules ---
        resolveWhile(
            sensorType: ReactiveSensorType,
            connector: IConnector,
            op: Comparison,
            threshold: number,
            action: ReactiveAction,
            target: MotorTarget,
            speed: number
        ): void {
            const pin = this._resolvePin(connector);
            const spd = action === ReactiveAction.Stop ? 0 : (speed === undefined ? 50 : speed);

            let condition: () => boolean;

            if (sensorType === ReactiveSensorType.Gray) {
                const sensor = this._getGraySensor(pin);
                condition = () => evalComparison(op, sensor.read(), threshold);

            } else if (sensorType === ReactiveSensorType.Distance) {
                const sensor = this._getDistanceSensor(pin);
                condition = () => evalComparison(op, sensor.read(), threshold);

            } else if (sensorType === ReactiveSensorType.Light) {
                const sensor = this._getLightSensor(pin);
                condition = () => evalComparison(op, sensor.read(), threshold);

            } else {
                const sensor = this._getButtonSensor(pin);
                const targetValue =
                    op === Comparison.Less
                        ? ButtonState.Released
                        : ButtonState.Pressed;

                condition = () =>
                    sensor.read() ===
                    (targetValue === ButtonState.Pressed ? 1 : 0);
            }

            this._registerPrimitiveRule(
                condition,
                action,
                target,
                spd
            );
        }

        /*whileGrayLineLossWithClearPath(
            grayConnector: IConnector,
            grayThreshold: number,
            distanceConnector: IConnector,
            clearDistance: number,
            target: MotorTarget
        ): void {
            const grayPin = this._resolvePin(grayConnector);
            const graySensor = this._getGraySensor(grayPin);
            const distPin = this._resolvePin(distanceConnector);
            const distSensor = this._getDistanceSensor(distPin);
            this._registerPrimitiveRule(
                () => {
                    if (!evalComparison(Comparison.GreaterOrEqual, graySensor.read(), grayThreshold)) {
                        return false;
                    }
                    const d = distSensor.read();
                    return d <= 0 || d >= clearDistance;
                },
                ReactiveAction.Stop,
                target,
                0,
                true
            );
        }

        whileArcAround(
            connector: IConnector,
            op: Comparison,
            threshold: number,
            side: ArcSide,
            speed: number
        ): void {
            const pin = this._resolvePin(connector);
            const sensor = this._getDistanceSensor(pin);
            const arc = new ArcManeuver(side, speed);
            const rule: IReactiveRule = {
                evaluate: () => {
                    const d = sensor.read();
                    if (d <= 0) return false;
                    return evalComparison(op, d, threshold);
                },
                action: ReactiveAction.ArcAround,
                target: MotorTarget.Both,
                speed: speed,
                priority: () => computePriority(ReactiveAction.ArcAround, MotorTarget.Both),
                suppressLineLoss: true,
                motorIntent: () => arc.getIntent(),
                tick: () => arc.tick(),
                reset: () => arc.reset(),
            };
            this._ensureReactiveHandler();
            this._eventMonitor.registerReactiveRule(rule);
        }

        stopReactiveMode(): void {
            this._eventMonitor.disableReactive();
            this.motorStop();
        }*/

        private _ensureReactiveHandler(): void {
            this._eventMonitor.setReactiveIntentHandler((intent) => {
                this._setMotorSpeed(intent.left, intent.right);
            });
        }

        private _registerPrimitiveRule(
            evaluate: () => boolean,
            action: ReactiveAction,
            target: MotorTarget,
            speed: number,
            lineLossStop?: boolean
        ): void {
            const rule: IReactiveRule = {
                evaluate: evaluate,
                action: action,
                target: target,
                speed: speed,
                priority: () => computePriority(action, target),
                lineLossStop: lineLossStop,
                motorIntent: () => buildMotorIntent(action, target, speed),
                tick: () => {},
                reset: () => {},
            };
            this._ensureReactiveHandler();
            this._eventMonitor.registerReactiveRule(rule);
        }

        // Exposed for tests — drives one polling cycle without sleeping.
        // Returns the subIds that fired this cycle.
        _stepEventMonitor(): number[] {
            return this._eventMonitor.pollOnce();
        }

        // --- Getters ---
        motorLeft(): number { return this._motorLeft; }
        motorRight(): number { return this._motorRight; }

        // --- Overridable stub ---
        start(): void {}
    }
}
