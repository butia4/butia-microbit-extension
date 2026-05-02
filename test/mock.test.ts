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
    poll(): void {}
    getPin(): number { return this._pin; }
    read(): number { return this._value; }
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
const motorRobot = new Butia.RobotBase(motors, [], [], [], []);

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
const lightA = new MockSensor(AnalogPin.P1, 750);
const lightB = new MockSensor(AnalogPin.P2, 200);
const gray = new MockSensor(AnalogPin.P2, 300);
const distance = new MockSensor(AnalogPin.P3, 25);

const sensorRobot = new Butia.RobotBase(
    new MockMotorDriver(),
    sensorConfig,
    [distance],
    [lightA, lightB],
    [gray]
);

assertMock(sensorRobot.readLightSensor(Butia.J1) === 750, "readLightSensor J1");
assertMock(sensorRobot.readLightSensor(Butia.J2) === 200, "readLightSensor J2 (multi-sensor lookup)");
assertMock(sensorRobot.readGraySensor(Butia.J2) === 300, "readGraySensor");
assertMock(sensorRobot.readDistanceSensor(Butia.J3) === 25, "readDistanceSensor");

basic.showString("ALL PASS sensors");
