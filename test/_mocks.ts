// Shared test doubles. Underscore-prefixed so it sorts before *.test.ts
// files in npm run sync — guarantees class declarations are available
// when the other test files are compiled.

class MockMotorDriver implements butia.IMotorDriver {
    left: number;
    right: number;
    constructor() { this.left = 0; this.right = 0; }
    init(): void {}
    setSpeed(left: number, right: number): void { this.left = left; this.right = right; }
    stop(): void { this.left = 0; this.right = 0; }
}

// Single mock sensor type for all four sensor flavors. Its value is
// mutable so event tests can simulate threshold crossings.
class MockSensor implements butia.ILightSensor, butia.IGraySensor, butia.IDistanceSensor, butia.IButtonSensor {
    private _value: number;
    constructor(value: number) { this._value = value; }
    init(): void {}
    read(): number { return this._value; }
    setValue(v: number): void { this._value = v; }
}

class MockServoDriver implements butia.IServoDriver {
    angle: number;
    constructor() {
        this.angle = -1;
    }
    init(): void {}
    setAngle(degrees: number): void { this.angle = degrees; }
}

namespace butia {
    // EventMonitor variant that skips the background fiber, so tests can
    // drive polling synchronously via _stepEventMonitor().
    export class TestEventMonitor extends EventMonitor {
        protected _ensureStarted(): void { /* no-op */ }
    }
}

class MockRobot extends butia.RobotBase {
    private _lightMocks: {id: number, sensor: butia.ILightSensor}[];
    private _grayMocks: {id: number, sensor: butia.IGraySensor}[];
    private _distanceMocks: {id: number, sensor: butia.IDistanceSensor}[];
    private _buttonMocks: {id: number, sensor: butia.IButtonSensor}[];
    private _genericMocks: {id: number, sensor: butia.IGenericSensor}[];
    private _servoMocks: {id: number, servo: butia.IServoDriver}[];

    constructor(motors: butia.IMotorDriver, config: butia.IConnectorChannels[]) {
        super(motors, config);
        this._lightMocks = [];
        this._grayMocks = [];
        this._distanceMocks = [];
        this._buttonMocks = [];
        this._genericMocks = [];
        this._servoMocks = [];
    }

    // `id` matches AnalogPin/DigitalPin/IChannel.id — mockButton(AnalogPin.P1, ...)
    // works because analog/digital Gpio channels on the same physical pin share
    // the same numeric id (see gpioAnalog/gpioDigital in core/connector.ts).
    mockLight(id: number, sensor: butia.ILightSensor): void { this._lightMocks.push({ id, sensor }); }
    mockGray(id: number, sensor: butia.IGraySensor): void { this._grayMocks.push({ id, sensor }); }
    mockDistance(id: number, sensor: butia.IDistanceSensor): void { this._distanceMocks.push({ id, sensor }); }
    mockButton(id: number, sensor: butia.IButtonSensor): void { this._buttonMocks.push({ id, sensor }); }
    mockGeneric(id: number, sensor: butia.IGenericSensor): void { this._genericMocks.push({ id, sensor }); }
    mockServo(id: number, servo: butia.IServoDriver): void { this._servoMocks.push({ id, servo }); }

    protected _newLightSensor(channel: butia.IChannel): butia.ILightSensor {
        for (const m of this._lightMocks) { if (m.id === channel.id) return m.sensor; }
        return super._newLightSensor(channel);
    }
    protected _newGraySensor(channel: butia.IChannel): butia.IGraySensor {
        for (const m of this._grayMocks) { if (m.id === channel.id) return m.sensor; }
        return super._newGraySensor(channel);
    }
    protected _newDistanceSensor(channel: butia.IChannel): butia.IDistanceSensor {
        for (const m of this._distanceMocks) { if (m.id === channel.id) return m.sensor; }
        return super._newDistanceSensor(channel);
    }
    protected _newButtonSensor(channel: butia.IChannel): butia.IButtonSensor {
        for (const m of this._buttonMocks) { if (m.id === channel.id) return m.sensor; }
        return super._newButtonSensor(channel);
    }
    protected _newGenericSensor(name: number, channel: butia.IChannel): butia.IGenericSensor {
        for (const m of this._genericMocks) { if (m.id === channel.id) return m.sensor; }
        return super._newGenericSensor(name, channel);
    }
    protected _newServoDriver(name: number, channel: butia.IChannel): butia.IServoDriver {
        for (const m of this._servoMocks) { if (m.id === channel.id) return m.servo; }
        return super._newServoDriver(name, channel);
    }
    protected _newEventMonitor(): butia.EventMonitor { return new butia.TestEventMonitor(); }
}

function assertTest(condition: boolean, label: string): void {
    if (condition) {
        basic.showString("PASS " + label);
    } else {
        control.fail("FAIL " + label);
    }
}
