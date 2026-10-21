// Mock-based behavioral tests for RobotBase — motor control and sensor reads.
// Mocks live in test/_mocks.ts.

// --- Motor behavioral tests ---

const motors = new MockMotorDriver();
const motorRobot = new butia.RobotBase(motors, []);

motorRobot.moveForward(60, 0);
assertTest(motors.left === 60 && motors.right === 60, "moveForward speed");

motorRobot.moveBackward(50, 0);
assertTest(motors.left === -50 && motors.right === -50, "moveBackward speed");

motorRobot.turn(ButiaTurnDirection.Left, 40);
assertTest(motors.left === -40 && motors.right === 40, "turn left");

motorRobot.turn(ButiaTurnDirection.Right, 40);
assertTest(motors.left === 40 && motors.right === -40, "turn right");

motorRobot.motorTank(50, -30);
assertTest(motors.left === 50 && motors.right === -30, "motorTank");

motorRobot.motorStop();
assertTest(motors.left === 0 && motors.right === 0, "motorStop");

// duration > 0 branch: basic.pause then auto-stop (not just fire-and-forget)
motorRobot.moveForward(60, 10);
assertTest(motors.left === 0 && motors.right === 0, "moveForward auto-stops after duration");

motorRobot.moveBackward(50, 10);
assertTest(motors.left === 0 && motors.right === 0, "moveBackward auto-stops after duration");

motorRobot.turn(ButiaTurnDirection.Left, 40, 10);
assertTest(motors.left === 0 && motors.right === 0, "turn auto-stops after duration");

basic.showString("ALL PASS motors");

// --- Sensor read tests ---

// Each connector can only be claimed by one sensor type, so the analog
// sensors and the buttons live on two separate robots.
const sensorConfig: butia.ConnectorChannels[] = [
    new butia.ConnectorChannels(butia.v2.J1, butia.gpioAnalog(AnalogPin.P1), butia.gpioDigital(DigitalPin.P1)),
    new butia.ConnectorChannels(butia.v2.J2, butia.gpioAnalog(AnalogPin.P2), butia.gpioDigital(DigitalPin.P2)),
    new butia.ConnectorChannels(butia.v2.J3, butia.gpioAnalog(AnalogPin.P3), butia.gpioDigital(DigitalPin.P3)),
    new butia.ConnectorChannels(butia.v2.J4, butia.gpioAnalog(AnalogPin.P4), butia.gpioDigital(DigitalPin.P4)),
    new butia.ConnectorChannels(butia.v2.J5, butia.gpioAnalog(AnalogPin.P10), butia.gpioDigital(DigitalPin.P10)),
];
const sensorRobot = new MockRobot(new MockMotorDriver(), sensorConfig);
sensorRobot.mockLight(AnalogPin.P1, new MockSensor(750));
sensorRobot.mockLight(AnalogPin.P2, new MockSensor(200));
sensorRobot.mockGray(AnalogPin.P3, new MockSensor(300));
sensorRobot.mockDistance(AnalogPin.P4, new MockSensor(25));
sensorRobot.mockGeneric(AnalogPin.P10, new MockSensor(88));

assertTest(sensorRobot.readLightSensor(butia.v2.J1) === 750, "readLightSensor J1");
assertTest(sensorRobot.readLightSensor(butia.v2.J2) === 200, "readLightSensor J2 (multi-sensor lookup)");
assertTest(sensorRobot.readGraySensor(butia.v2.J3) === 300, "readGraySensor");
assertTest(sensorRobot.readDistanceSensor(butia.v2.J4) === 25, "readDistanceSensor");
assertTest(sensorRobot.readGenericSensor(butia.v2.J5, 0) === 88, "readGenericSensor");

const buttonRobot = new MockRobot(new MockMotorDriver(), sensorConfig);
buttonRobot.mockButton(DigitalPin.P1, new MockSensor(1));
buttonRobot.mockButton(DigitalPin.P2, new MockSensor(0));

assertTest(buttonRobot.readButton(butia.v2.J1) === true, "readButton pressed");
assertTest(buttonRobot.readButton(butia.v2.J2) === false, "readButton released");

// --- Channel claims: a connector can't host two sensor types ---

let claimFailed = false;
try {
    sensorRobot.readGraySensor(butia.v2.J1);
} catch (e) {
    claimFailed = true;
}
assertTest(claimFailed, "reading a different sensor type on a claimed connector fails");

basic.showString("ALL PASS sensors");
