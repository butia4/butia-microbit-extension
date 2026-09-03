// PXT does not support `abstract class` — this DI base class is the approved substitute.

namespace butia {
    type ChannelRole = "analog" | "digital";

    export class RobotBase implements IRobot {
        // --- Fields ---
        private _motors: IMotorDriver;
        private _lights: {channel: IChannel, sensor: ILightSensor}[];
        private _grays: {channel: IChannel, sensor: IGraySensor}[];
        private _distances: {channel: IChannel, sensor: IDistanceSensor}[];
        private _buttons: {channel: IChannel, sensor: IButtonSensor}[];
        private _generics: {channel: IChannel, sensor: IGenericSensor}[];
        private _servos: {channel: IChannel, servo: IServoDriver}[];
        protected _connectorConfig: IConnectorChannels[];
        private _motorLeft: number;
        private _motorRight: number;
        private _channelUsage: { connectorName: string; channel: IChannel; type: string }[];
        private _eventMonitor: EventMonitor;
        private _modelId: string;
        // --- Constructor ---
        constructor(
            motors: IMotorDriver,
            connectorConfig: IConnectorChannels[],
            modelId?: string
        ) {
            this._motors = motors;
            this._connectorConfig = connectorConfig;
            this._lights = [];
            this._grays = [];
            this._distances = [];
            this._buttons = [];
            this._generics = [];
            this._servos = [];
            this._motorLeft = 0;
            this._motorRight = 0;
            this._channelUsage = [];
            this._eventMonitor = this._newEventMonitor();
            // PXT only allows numeric/null/boolean literal default params, so
            // the "unknown" fallback goes here instead of in the signature.
            this._modelId = modelId ? modelId : "unknown";
        }

        // Overridable factory — tests use this to inject a monitor that
        // doesn't auto-start the background fiber.
        protected _newEventMonitor(): EventMonitor { return new EventMonitor(); }

        // --- Private helpers ---
        private _resolveChannel(connector: IConnector, role: ChannelRole): IChannel {
            for (const cc of this._connectorConfig) {
                if (cc.connector.name === connector.name) {
                    const channel = role === "analog" ? cc.analog : cc.digital;
                    if (channel) return channel;
                    control.fail("Connector " + connector.name + " has no " + role + " channel.");
                    return { kind: ChannelKind.Gpio, id: 0 } as IChannel;
                }
            }
            control.fail("Connector " + connector.name + " not found.");
            return { kind: ChannelKind.Gpio, id: 0 } as IChannel;
        }

        private _requireGpioPin(channel: IChannel, role: string): AnalogPin | DigitalPin {
            if (channel.kind !== ChannelKind.Gpio) {
                control.fail("The " + role + " channel is not a direct pin; the robot must override its factory for non-Gpio channels.");
                return 0 as AnalogPin;
            }
            return (channel as IGpioChannel).pin;
        }

        // Claims are tracked per connector, not per channel: a connector is a
        // single physical header, so even if its analog and digital channels
        // are different pins, only one sensor can ever be plugged into it at
        // a time. Using the analog channel for one sensor type must block the
        // digital channel of that same connector from being claimed for a
        // different type, and vice versa.
        private _claimChannel(channel: IChannel, type: string): void {
            let connectorName = "";
            let found = false;
            for (const cc of this._connectorConfig) {
                if ((cc.analog && cc.analog.id === channel.id) || (cc.digital && cc.digital.id === channel.id)) {
                    connectorName = cc.connector.name;
                    found = true;
                    break;
                }
            }
            if (!found) {
                control.fail("Channel " + channel.id + " is not on any configured connector.");
                return;
            }
            for (const entry of this._channelUsage) {
                if (entry.connectorName === connectorName) {
                    if (entry.channel.id === channel.id && entry.type === type) return;
                    control.fail("Connector " + connectorName + " is already in use as " + entry.type);
                    return;
                }
            }
            this._channelUsage.push({ connectorName, channel, type });
        }

        // --- Sensor factories (overridable for testing, and for robots with I2c channels) ---
        protected _newLightSensor(channel: IChannel): ILightSensor { return new LightSensor(this._requireGpioPin(channel, "light") as AnalogPin); }
        protected _newGraySensor(channel: IChannel): IGraySensor { return new GraySensor(this._requireGpioPin(channel, "gray") as AnalogPin); }
        protected _newDistanceSensor(channel: IChannel): IDistanceSensor { return new DistanceSensor(this._requireGpioPin(channel, "distance") as AnalogPin); }
        protected _newButtonSensor(channel: IChannel): IButtonSensor { return new ButtonSensor(this._requireGpioPin(channel, "button") as DigitalPin); }
        protected _newGenericSensor(name: number, channel: IChannel): IGenericSensor { return new GenericSensor(this._requireGpioPin(channel, "generic") as AnalogPin, name); }
        protected _newServoDriver(name: number, channel: IChannel): IServoDriver { return new ServoDriver(this._requireGpioPin(channel, "servo") as AnalogPin, name); }

        private _getLightSensor(channel: IChannel): ILightSensor {
            for (const entry of this._lights) {
                if (entry.channel.id === channel.id) return entry.sensor;
            }
            this._claimChannel(channel, "light");
            const sensor = this._newLightSensor(channel);
            this._lights.push({ channel, sensor });
            return sensor;
        }

        private _getGraySensor(channel: IChannel): IGraySensor {
            for (const entry of this._grays) {
                if (entry.channel.id === channel.id) return entry.sensor;
            }
            this._claimChannel(channel, "gray");
            const sensor = this._newGraySensor(channel);
            this._grays.push({ channel, sensor });
            return sensor;
        }

        private _getDistanceSensor(channel: IChannel): IDistanceSensor {
            for (const entry of this._distances) {
                if (entry.channel.id === channel.id) return entry.sensor;
            }
            this._claimChannel(channel, "distance");
            const sensor = this._newDistanceSensor(channel);
            this._distances.push({ channel, sensor });
            return sensor;
        }

        private _getButtonSensor(channel: IChannel): IButtonSensor {
            for (const entry of this._buttons) {
                if (entry.channel.id === channel.id) return entry.sensor;
            }
            this._claimChannel(channel, "button");
            const sensor = this._newButtonSensor(channel);
            this._buttons.push({ channel, sensor });
            return sensor;
        }

        private _getGenericSensor(channel: IChannel, name: number): IGenericSensor {
            for (const entry of this._generics) {
                if (entry.channel.id === channel.id) return entry.sensor;
            }
            this._claimChannel(channel, "generic");
            const sensor = this._newGenericSensor(name, channel);
            this._generics.push({ channel, sensor });
            return sensor;
        }

        private _getServoDriver(channel: IChannel, name: number): IServoDriver {
            for (const entry of this._servos) {
                if (entry.channel.id === channel.id) return entry.servo;
            }
            this._claimChannel(channel, "servo");
            const servo = this._newServoDriver(name, channel);
            this._servos.push({ channel, servo });
            return servo;
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

        turn(direction: ButiaTurnDirection, speed: number = 60, duration?: number): void {
            if (direction === ButiaTurnDirection.Left) {
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
            const s = this._getDistanceSensor(this._resolveChannel(connector, "analog"));
            return s.read();
        }

        readLightSensor(connector: IConnector): number {
            const s = this._getLightSensor(this._resolveChannel(connector, "analog"));
            return s.read();
        }

        readGraySensor(connector: IConnector): number {
            const s = this._getGraySensor(this._resolveChannel(connector, "analog"));
            return s.read();
        }

        readButton(connector: IConnector): boolean {
            const s = this._getButtonSensor(this._resolveChannel(connector, "digital"));
            return s.read() === 1;
        }

        readGenericSensor(connector: IConnector, name: number): number {
            const s = this._getGenericSensor(this._resolveChannel(connector, "analog"), name);
            return s.read();
        }

        // --- Servos ---
        servoSetAngle(connector: IConnector, name: number, degrees: number): void {
            this._getServoDriver(this._resolveChannel(connector, "analog"), name).setAngle(degrees);
        }

        // --- Events ---

        onDistance(connector: IConnector, op: ButiaComparison, threshold: number, priority: number, handler: () => void): void {
            const channel = this._resolveChannel(connector, "analog");
            const sensor = this._getDistanceSensor(channel);
            const subId = computeSubId(sensorTypeDistance, channel.id, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => {
                    const d = sensor.read();
                    if (d <= 0) return false;
                    return evalComparison(op, d, threshold);
                },
                priority,
                handler,
            };
            this._eventMonitor.register(monitor);
        }

        onLight(connector: IConnector, op: ButiaComparison, threshold: number, priority: number, handler: () => void): void {
            const channel = this._resolveChannel(connector, "analog");
            const sensor = this._getLightSensor(channel);
            const subId = computeSubId(sensorTypeLight, channel.id, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => evalComparison(op, sensor.read(), threshold),
                priority,
                handler,
            };
            this._eventMonitor.register(monitor);
        }

        onGray(connector: IConnector, op: ButiaComparison, threshold: number, priority: number, handler: () => void): void {
            const channel = this._resolveChannel(connector, "analog");
            const sensor = this._getGraySensor(channel);
            const subId = computeSubId(sensorTypeGray, channel.id, comparisonToDir(op));
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => evalComparison(op, sensor.read(), threshold),
                priority,
                handler,
            };
            this._eventMonitor.register(monitor);
        }

        onConnectorButton(connector: IConnector, state: ButiaButtonState, priority: number, handler: () => void): void {
            const channel = this._resolveChannel(connector, "digital");
            const sensor = this._getButtonSensor(channel);
            const dir = state === ButiaButtonState.Pressed ? dirGreaterOrPressed : dirLessOrReleased;
            const subId = computeSubId(sensorTypeButton, channel.id, dir);
            const target = state === ButiaButtonState.Pressed ? 1 : 0;
            const monitor: IMonitor = {
                subId: subId,
                evaluate: () => sensor.read() === target,
                priority,
                handler,
            };
            this._eventMonitor.register(monitor);
        }

        // Exposed for tests — drives one polling cycle without sleeping.
        // Returns the subIds that fired this cycle.
        _stepEventMonitor(): number {
            return this._eventMonitor.pollOnce();
        }

        // --- Getters ---
        motorLeft(): number { return this._motorLeft; }
        motorRight(): number { return this._motorRight; }
        // Exposes the active model's identity/wiring so RobotDriver and sim
        // code can branch on it instead of hardcoding one robot's layout.
        modelId(): string { return this._modelId; }
        connectorConfig(): IConnectorChannels[] { return this._connectorConfig; }
        motors(): IMotorDriver { return this._motors; }

        // --- Overridable stub ---
        start(): void {}
    }
}
