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
    private _lightMocks: {pin: AnalogPin | DigitalPin, sensor: butia.ILightSensor}[];
    private _grayMocks: {pin: AnalogPin | DigitalPin, sensor: butia.IGraySensor}[];
    private _distanceMocks: {pin: AnalogPin | DigitalPin, sensor: butia.IDistanceSensor}[];
    private _buttonMocks: {pin: AnalogPin | DigitalPin, sensor: butia.IButtonSensor}[];
    private _servoMocks: {pin: AnalogPin | DigitalPin, servo: butia.IServoDriver}[];

    constructor(motors: butia.IMotorDriver, config: butia.IConnectorPin[]) {
        super(motors, config);
        this._lightMocks = [];
        this._grayMocks = [];
        this._distanceMocks = [];
        this._buttonMocks = [];
        this._servoMocks = [];
    }

    mockLight(pin: AnalogPin | DigitalPin, sensor: butia.ILightSensor): void { this._lightMocks.push({ pin, sensor }); }
    mockGray(pin: AnalogPin | DigitalPin, sensor: butia.IGraySensor): void { this._grayMocks.push({ pin, sensor }); }
    mockDistance(pin: AnalogPin | DigitalPin, sensor: butia.IDistanceSensor): void { this._distanceMocks.push({ pin, sensor }); }
    mockButton(pin: AnalogPin | DigitalPin, sensor: butia.IButtonSensor): void { this._buttonMocks.push({ pin, sensor }); }
    mockServo(pin: AnalogPin | DigitalPin, servo: butia.IServoDriver): void { this._servoMocks.push({ pin, servo }); }

    protected _newLightSensor(pin: AnalogPin | DigitalPin): butia.ILightSensor {
        for (const m of this._lightMocks) { if (m.pin === pin) return m.sensor; }
        return super._newLightSensor(pin);
    }
    protected _newGraySensor(pin: AnalogPin | DigitalPin): butia.IGraySensor {
        for (const m of this._grayMocks) { if (m.pin === pin) return m.sensor; }
        return super._newGraySensor(pin);
    }
    protected _newDistanceSensor(pin: AnalogPin | DigitalPin): butia.IDistanceSensor {
        for (const m of this._distanceMocks) { if (m.pin === pin) return m.sensor; }
        return super._newDistanceSensor(pin);
    }
    protected _newButtonSensor(pin: AnalogPin | DigitalPin): butia.IButtonSensor {
        for (const m of this._buttonMocks) { if (m.pin === pin) return m.sensor; }
        return super._newButtonSensor(pin);
    }
    protected _newServoDriver(name: number, pin: AnalogPin | DigitalPin): butia.IServoDriver {
        for (const m of this._servoMocks) { if (m.pin === pin) return m.servo; }
        return super._newServoDriver(name, pin);
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
