// Tests the butiaV2/butiaV4 namespace wrapper functions themselves (the
// //% block=... layer in src/blocks/blocks-v2.ts / blocks-v4.ts), not
// RobotBase. Every other test file in this suite calls into RobotBase
// directly and bypasses these wrappers entirely, so a regression introduced
// only in the hand-duplicated v2/v4 block layer (wrong param order, wrong
// return value, broken delegation to RobotDriver.currentRobot()) would not
// be caught anywhere else.
//
// Approach: start the real RobotDriver singleton for each model, then swap
// its underlying robot for a fresh MockRobot via _setSimRobot() before each
// case, so each block call can be checked against an observable mock instead
// of real hardware pins. A fresh MockRobot per case avoids "pin already
// claimed as a different sensor type" failures — v4 only wires 3 connectors
// (J1-J3) to 3 physical pins, too few to host every sensor kind at once on
// one instance. A case PASSes only if the wrapper both forwarded the
// arguments correctly AND returned/propagated the mocked value — not merely
// "didn't throw".

function useMockV2(): MockRobot {
    butia.RobotDriver._resetForTests();
    butia.RobotDriver.start(butia.butiaV2);
    const mock = new MockRobot(new MockMotorDriver(), butia.RobotDriver.currentRobot().connectorConfig());
    butia.RobotDriver.instance()._setSimRobot(mock);
    return mock;
}

function useMockV4(): MockRobot {
    butia.RobotDriver._resetForTests();
    butia.RobotDriver.start(butia.butiaV4);
    const mock = new MockRobot(new MockMotorDriver(), butia.RobotDriver.currentRobot().connectorConfig());
    butia.RobotDriver.instance()._setSimRobot(mock);
    return mock;
}

// --- Butia v2 ---

let mV2 = useMockV2();
butiaV2.moveForward(65, 0);
assertTest(
    (mV2.motors() as MockMotorDriver).left === 65 && (mV2.motors() as MockMotorDriver).right === 65,
    "butiaV2.moveForward forwards speed to both motors"
);

mV2 = useMockV2();
butiaV2.motorTank(20, -35);
assertTest(
    (mV2.motors() as MockMotorDriver).left === 20 && (mV2.motors() as MockMotorDriver).right === -35,
    "butiaV2.motorTank forwards left/right independently"
);

mV2 = useMockV2();
mV2.mockGray(AnalogPin.P1, new MockSensor(42));
assertTest(butiaV2.readGraySensor(butia.v2.J1) === 42, "butiaV2.readGraySensor returns mocked value");

mV2 = useMockV2();
mV2.mockLight(AnalogPin.P2, new MockSensor(77));
assertTest(butiaV2.readLightSensor(butia.v2.J2) === 77, "butiaV2.readLightSensor returns mocked value");

mV2 = useMockV2();
mV2.mockDistance(AnalogPin.P3, new MockSensor(15));
assertTest(butiaV2.obstacleDistance(butia.v2.J3) === 15, "butiaV2.obstacleDistance returns mocked value");

mV2 = useMockV2();
mV2.mockButton(AnalogPin.P4, new MockSensor(1));
assertTest(butiaV2.readButton(butia.v2.J4) === true, "butiaV2.readButton returns mocked value");

mV2 = useMockV2();
mV2.mockGeneric(AnalogPin.P10, new MockSensor(99));
assertTest(butiaV2.readGenericSensor(0, butia.v2.J5) === 99, "butiaV2.readGenericSensor forwards connector/name and returns value");

mV2 = useMockV2();
const servoV2 = new MockServoDriver();
mV2.mockServo(AnalogPin.P4, servoV2);
butiaV2.servoSetAngle(0, butia.v2.J4, 123);
assertTest(servoV2.angle === 123, "butiaV2.servoSetAngle forwards degrees to the servo driver");

// --- Butia v4 ---

let mV4 = useMockV4();
butiaV4.moveForward(80, 0);
assertTest(
    (mV4.motors() as MockMotorDriver).left === 80 && (mV4.motors() as MockMotorDriver).right === 80,
    "butiaV4.moveForward forwards speed to both motors"
);

mV4 = useMockV4();
butiaV4.motorTank(-10, 90);
assertTest(
    (mV4.motors() as MockMotorDriver).left === -10 && (mV4.motors() as MockMotorDriver).right === 90,
    "butiaV4.motorTank forwards left/right independently"
);

mV4 = useMockV4();
mV4.mockGray(AnalogPin.P0, new MockSensor(11));
assertTest(butiaV4.readGraySensor(butia.v4.J1) === 11, "butiaV4.readGraySensor returns mocked value");

mV4 = useMockV4();
mV4.mockLight(AnalogPin.P1, new MockSensor(22));
assertTest(butiaV4.readLightSensor(butia.v4.J2) === 22, "butiaV4.readLightSensor returns mocked value");

mV4 = useMockV4();
mV4.mockDistance(AnalogPin.P2, new MockSensor(33));
assertTest(butiaV4.obstacleDistance(butia.v4.J3) === 33, "butiaV4.obstacleDistance returns mocked value");

mV4 = useMockV4();
mV4.mockButton(AnalogPin.P0, new MockSensor(0));
assertTest(butiaV4.readButton(butia.v4.J1) === false, "butiaV4.readButton returns mocked value");

mV4 = useMockV4();
mV4.mockGeneric(AnalogPin.P1, new MockSensor(44));
assertTest(butiaV4.readGenericSensor(0, butia.v4.J2) === 44, "butiaV4.readGenericSensor forwards connector/name and returns value");

mV4 = useMockV4();
const servoV4 = new MockServoDriver();
mV4.mockServo(AnalogPin.P2, servoV4);
butiaV4.servoSetAngle(0, butia.v4.J3, 45);
assertTest(servoV4.angle === 45, "butiaV4.servoSetAngle forwards degrees to the servo driver");

// Restore v4 as active so later test files in the run (alphabetically after
// this one) that assume an already-started singleton keep working.
butia.RobotDriver._resetForTests();
butia.RobotDriver.start(butia.butiaV4);

basic.showString("ALL PASS block-wrapper-delegation");
