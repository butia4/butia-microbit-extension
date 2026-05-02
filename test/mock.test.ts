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
    private _pin: number;
    private _value: number;
    constructor(pin: number, value: number) { this._pin = pin; this._value = value; }
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
const motorRobot = new Butia.RobotBase(motors, [], [], []);

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
// connectorPins is global to the robot — all sensor types on a connector share the same pin.

RobotSystem.reset();

const lightA = new MockSensor(AnalogPin.P1, 750);
const lightB = new MockSensor(AnalogPin.P2, 200);
const gray = new MockSensor(AnalogPin.P3, 300);
const distance = new MockSensor(AnalogPin.P4, 25);

class SensorMockBuilder implements IRobotRecord {
    model: RobotModel;
    defaultConfig: IRobotConfig;

    constructor() {
        this.model = RobotModel.Butia4;
        this.defaultConfig = {
            connectorPins: [
                { connector: Connector.Port1, pin: DigitalPin.P1 },
                { connector: Connector.Port2, pin: DigitalPin.P2 },
                { connector: Connector.Port3, pin: DigitalPin.P3 },
                { connector: Connector.Port4, pin: DigitalPin.P4 },
            ],
            motorLeftConnectors: [] as Connector[],
            motorRightConnectors: [] as Connector[],
        };
    }

    build(_cfg: IRobotConfig): IRobot {
        return new Butia.RobotBase(
            new MockMotorDriver(),
            [distance],
            [lightA, lightB],
            [gray]
        );
    }
}

RobotSystem.register(new SensorMockBuilder());
RobotSystem.setActive(RobotModel.Butia4);

const sensorRobot = RobotSystem.activeRobot();

assertMock(sensorRobot.readLightSensor(Connector.Port1) === 750, "readLightSensor Port1");
assertMock(sensorRobot.readLightSensor(Connector.Port2) === 200, "readLightSensor Port2");
assertMock(sensorRobot.readGraySensor(Connector.Port3) === 300, "readGraySensor Port3");
assertMock(sensorRobot.readDistanceSensor(Connector.Port4) === 25, "readDistanceSensor Port4");

basic.showString("ALL PASS sensors");
