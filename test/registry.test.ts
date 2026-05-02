// Tests for RobotSystem registry behavior.

function assertRegistry(condition: boolean, label: string): void {
    if (condition) {
        basic.showString("PASS " + label);
    } else {
        control.fail("FAIL " + label);
    }
}

class MockRobot implements IRobot {
    started: boolean;
    constructor() { this.started = false; }
    start(): void { this.started = true; }
    moveForward(_speed: number, _duration?: number): void {}
    moveBackward(_speed: number, _duration?: number): void {}
    turn(_direction: TurnDirection, _speed: number, _duration?: number): void {}
    motorTank(_left: number, _right: number): void {}
    motorStop(): void {}
    setAssist(_flag: RobotAssist, _enabled: boolean): void {}
    readDistanceSensor(_connector: Connector): number { return 0; }
    readGraySensor(_connector: Connector): number { return 0; }
    readLightSensor(_connector: Connector): number { return 0; }
    readButton(_connector: Connector): boolean { return false; }
    startMonitoring(_sensor: number, _pin: number, _threshold: number): void {}
    onLevelReached(_sensor: number, _pin: number, _handler: () => void): void {}
    onLevelUnreached(_sensor: number, _pin: number, _handler: () => void): void {}
    startMonitoringButton(_pin: number): void {}
    onButton(_pin: number, _handler: () => void): void {}
}

class MockBuilder implements IRobotRecord {
    model: RobotModel;
    defaultConfig: IRobotConfig;
    private _robot: MockRobot;

    constructor(
        model: RobotModel,
        robot: MockRobot,
        connectorPins: { connector: Connector; pin: DigitalPin }[]
    ) {
        this.model = model;
        this._robot = robot;
        this.defaultConfig = {
            connectorPins: connectorPins,
            motorLeftConnectors: [] as Connector[],
            motorRightConnectors: [] as Connector[],
        };
    }

    build(_cfg: IRobotConfig): IRobot {
        return this._robot;
    }
}

// --- register() stores a record ---
RobotSystem.reset();
const mockRobotA = new MockRobot();
RobotSystem.register(new MockBuilder(RobotModel.Butia4, mockRobotA, [
    { connector: Connector.Port1, pin: DigitalPin.P1 },
    { connector: Connector.Port2, pin: DigitalPin.P2 },
]));
RobotSystem.setActive(RobotModel.Butia4);
assertRegistry(RobotSystem.activeRobot() === mockRobotA, "register stores record");

// --- setActive() no-op when called again with same model ---
RobotSystem.reset();
const mockRobotB = new MockRobot();
RobotSystem.register(new MockBuilder(RobotModel.Butia4, mockRobotB, []));
RobotSystem.setActive(RobotModel.Butia4);
RobotSystem.setActive(RobotModel.Butia4);
assertRegistry(RobotSystem.activeRobot() === mockRobotB, "setActive no-op same model");

// --- resolveAnalog() returns correct AnalogPin ---
RobotSystem.reset();
const mockRobotC = new MockRobot();
RobotSystem.register(new MockBuilder(
    RobotModel.Butia4, mockRobotC,
    [
        { connector: Connector.Port1, pin: DigitalPin.P1 },
        { connector: Connector.Port3, pin: DigitalPin.P3 },
    ]
));
RobotSystem.setActive(RobotModel.Butia4);
assertRegistry(RobotSystem.resolveAnalog(Connector.Port1) === AnalogPin.P1, "resolveAnalog Port1");
assertRegistry(RobotSystem.resolveAnalog(Connector.Port3) === AnalogPin.P3, "resolveAnalog Port3");

// --- activeRobot() returns active IRobot ---
RobotSystem.reset();
const mockRobotD = new MockRobot();
RobotSystem.register(new MockBuilder(RobotModel.Butia3, mockRobotD, []));
RobotSystem.setActive(RobotModel.Butia3);
assertRegistry(RobotSystem.activeRobot() === mockRobotD, "activeRobot returns correct robot");

// --- setActive() conflict: different model must fail ---
RobotSystem.reset();
RobotSystem.register(new MockBuilder(RobotModel.Butia4, new MockRobot(), []));
RobotSystem.register(new MockBuilder(RobotModel.Butia3, new MockRobot(), []));
RobotSystem.setActive(RobotModel.Butia4);
let conflictFailed = false;
try {
    RobotSystem.setActive(RobotModel.Butia3);
} catch {
    conflictFailed = true;
}
assertRegistry(conflictFailed, "setActive conflict fails");

// --- resolveAnalog() before setActive must fail ---
RobotSystem.reset();
RobotSystem.register(new MockBuilder(RobotModel.Butia4, new MockRobot(), [
    { connector: Connector.Port1, pin: DigitalPin.P1 },
]));
let beforeActiveFailed = false;
try {
    RobotSystem.resolveAnalog(Connector.Port1);
} catch {
    beforeActiveFailed = true;
}
assertRegistry(beforeActiveFailed, "resolveAnalog before setActive fails");

basic.showString("ALL PASS registry");
