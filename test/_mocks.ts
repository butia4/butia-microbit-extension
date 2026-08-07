// Shared test doubles. Underscore-prefixed so it sorts before *.test.ts
// files in npm run sync — guarantees class declarations are available
// when the other test files are compiled.

class MockMotorDriver implements Butia.IMotorDriver {
    left: number;
    right: number;
    constructor() { this.left = 0; this.right = 0; }
    init(): void {}
    setSpeed(left: number, right: number): void { this.left = left; this.right = right; }
    stop(): void { this.left = 0; this.right = 0; }
}

// Single mock sensor type for all four sensor flavors. Its value is
// mutable so event tests can simulate threshold crossings.
class MockSensor implements Butia.ILightSensor, Butia.IGraySensor, Butia.IDistanceSensor, Butia.IButtonSensor {
    private _pin: AnalogPin | DigitalPin;
    private _value: number;
    constructor(pin: AnalogPin | DigitalPin, value: number) { this._pin = pin; this._value = value; }
    init(): void {}
    getPin(): number { return this._pin; }
    read(): number { return this._value; }
    setValue(v: number): void { this._value = v; }
}

class MockServoDriver implements Butia.IServoDriver {
    angle: number;
    constructor() {
        this.angle = -1;
    }
    init(): void {}
    setAngle(degrees: number): void { this.angle = degrees; }
}

namespace Butia {
    // EventMonitor variant that skips the background fiber, so tests can
    // drive polling synchronously via _stepEventMonitor().
    export class TestEventMonitor extends EventMonitor {
        protected _ensureStarted(): void { /* no-op */ }
    }
}

class MockRobot extends Butia.RobotBase {
    private _lightMocks: {pin: AnalogPin | DigitalPin, sensor: Butia.ILightSensor}[];
    private _grayMocks: {pin: AnalogPin | DigitalPin, sensor: Butia.IGraySensor}[];
    private _distanceMocks: {pin: AnalogPin | DigitalPin, sensor: Butia.IDistanceSensor}[];
    private _buttonMocks: {pin: AnalogPin | DigitalPin, sensor: Butia.IButtonSensor}[];
    private _servoMocks: {pin: AnalogPin | DigitalPin, servo: Butia.IServoDriver}[];

    constructor(motors: Butia.IMotorDriver, config: Butia.IConnectorPin[]) {
        super(motors, config);
        this._lightMocks = [];
        this._grayMocks = [];
        this._distanceMocks = [];
        this._buttonMocks = [];
        this._servoMocks = [];
    }

    mockLight(pin: AnalogPin | DigitalPin, sensor: Butia.ILightSensor): void { this._lightMocks.push({ pin, sensor }); }
    mockGray(pin: AnalogPin | DigitalPin, sensor: Butia.IGraySensor): void { this._grayMocks.push({ pin, sensor }); }
    mockDistance(pin: AnalogPin | DigitalPin, sensor: Butia.IDistanceSensor): void { this._distanceMocks.push({ pin, sensor }); }
    mockButton(pin: AnalogPin | DigitalPin, sensor: Butia.IButtonSensor): void { this._buttonMocks.push({ pin, sensor }); }
    mockServo(pin: AnalogPin | DigitalPin, servo: Butia.IServoDriver): void { this._servoMocks.push({ pin, servo }); }

    protected _newLightSensor(pin: AnalogPin | DigitalPin): Butia.ILightSensor {
        for (const m of this._lightMocks) { if (m.pin === pin) return m.sensor; }
        return super._newLightSensor(pin);
    }
    protected _newGraySensor(pin: AnalogPin | DigitalPin): Butia.IGraySensor {
        for (const m of this._grayMocks) { if (m.pin === pin) return m.sensor; }
        return super._newGraySensor(pin);
    }
    protected _newDistanceSensor(pin: AnalogPin | DigitalPin): Butia.IDistanceSensor {
        for (const m of this._distanceMocks) { if (m.pin === pin) return m.sensor; }
        return super._newDistanceSensor(pin);
    }
    protected _newButtonSensor(pin: AnalogPin | DigitalPin): Butia.IButtonSensor {
        for (const m of this._buttonMocks) { if (m.pin === pin) return m.sensor; }
        return super._newButtonSensor(pin);
    }
    protected _newServoDriver(name: number, pin: AnalogPin | DigitalPin): Butia.IServoDriver {
        for (const m of this._servoMocks) { if (m.pin === pin) return m.servo; }
        return super._newServoDriver(name, pin);
    }
    protected _newEventMonitor(): Butia.EventMonitor { return new Butia.TestEventMonitor(); }
}

function assertTest(condition: boolean, label: string): void {
    if (condition) {
        basic.showString("PASS " + label);
    } else {
        control.fail("FAIL " + label);
    }
}
