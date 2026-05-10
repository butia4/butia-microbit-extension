// Mock-based behavioral tests for RobotBase — motor control and sensor reads.

class MockMotorDriver implements IMotorDriver {
    left: number;
    right: number;
    constructor() { this.left = 0; this.right = 0; }
    init(): void {}
    setSpeed(left: number, right: number): void { this.left = left; this.right = right; }
    stop(): void { this.left = 0; this.right = 0; }
}

class MockSensor implements ILightSensor, IGraySensor, IDistanceSensor {
    private _pin: AnalogPin;
    private _value: number;
    constructor(pin: AnalogPin, value: number) { this._pin = pin; this._value = value; }
    init(): void {}
    getPin(): number { return this._pin; }
    read(): number { return this._value; }
}

class MockRobot extends Butia.RobotBase {
    private _lightMocks: {pin: AnalogPin | DigitalPin, sensor: ILightSensor}[];
    private _grayMocks: {pin: AnalogPin | DigitalPin, sensor: IGraySensor}[];
    private _distanceMocks: {pin: AnalogPin | DigitalPin, sensor: IDistanceSensor}[];

    constructor(motors: IMotorDriver, config: IConnectorPin[]) {
        super(motors, config);
        this._lightMocks = [];
        this._grayMocks = [];
        this._distanceMocks = [];
    }

    mockLight(pin: AnalogPin | DigitalPin, sensor: ILightSensor): void { this._lightMocks.push({ pin, sensor }); }
    mockGray(pin: AnalogPin | DigitalPin, sensor: IGraySensor): void { this._grayMocks.push({ pin, sensor }); }
    mockDistance(pin: AnalogPin | DigitalPin, sensor: IDistanceSensor): void { this._distanceMocks.push({ pin, sensor }); }

    protected _newLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
        for (const m of this._lightMocks) { if (m.pin === pin) return m.sensor; }
        return super._newLightSensor(pin);
    }
    protected _newGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
        for (const m of this._grayMocks) { if (m.pin === pin) return m.sensor; }
        return super._newGraySensor(pin);
    }
    protected _newDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
        for (const m of this._distanceMocks) { if (m.pin === pin) return m.sensor; }
        return super._newDistanceSensor(pin);
    }
}

function assertMock(condition: boolean, label: string): void {
    if (condition) {
        basic.showString("PASS " + label);
    } else {
        control.fail("FAIL " + label);
    }
}

// --- Motor behavioral tests ---

const motors = new MockMotorDriver();
const motorRobot = new Butia.RobotBase(motors, []);

motorRobot.moveForward(60);
assertMock(motors.left === 60 && motors.right === 60, "moveForward speed");

motorRobot.moveBackward(50);
assertMock(motors.left === -50 && motors.right === -50, "moveBackward speed");

motorRobot.turn(TurnDirection.Left, 40);
assertMock(motors.left === -40 && motors.right === 40, "turn left");

motorRobot.turn(TurnDirection.Right, 40);
assertMock(motors.left === 40 && motors.right === -40, "turn right");

motorRobot.motorTank(50, -30);
assertMock(motors.left === 50 && motors.right === -30, "motorTank");

motorRobot.motorStop();
assertMock(motors.left === 0 && motors.right === 0, "motorStop");

basic.showString("ALL PASS motors");

// --- Sensor read tests ---

const sensorConfig: Butia.ConnectorPin[] = [
    new Butia.ConnectorPin(Butia.J1, AnalogPin.P1),
    new Butia.ConnectorPin(Butia.J2, AnalogPin.P2),
    new Butia.ConnectorPin(Butia.J3, AnalogPin.P3),
];
const sensorRobot = new MockRobot(new MockMotorDriver(), sensorConfig);
sensorRobot.mockLight(AnalogPin.P1, new MockSensor(AnalogPin.P1, 750));
sensorRobot.mockLight(AnalogPin.P2, new MockSensor(AnalogPin.P2, 200));
sensorRobot.mockGray(AnalogPin.P2, new MockSensor(AnalogPin.P2, 300));
sensorRobot.mockDistance(AnalogPin.P3, new MockSensor(AnalogPin.P3, 25));

assertMock(sensorRobot.readLightSensor(Butia.J1) === 750, "readLightSensor J1");
assertMock(sensorRobot.readLightSensor(Butia.J2) === 200, "readLightSensor J2 (multi-sensor lookup)");
assertMock(sensorRobot.readGraySensor(Butia.J2) === 300, "readGraySensor");
assertMock(sensorRobot.readDistanceSensor(Butia.J3) === 25, "readDistanceSensor");

basic.showString("ALL PASS sensors");
