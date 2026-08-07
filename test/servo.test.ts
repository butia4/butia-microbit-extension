// Tests for servo driver integration via RobotBase.

const servoConfig: Butia.ConnectorPin[] = [
    new Butia.ConnectorPin(Butia.J1, AnalogPin.P1),
    new Butia.ConnectorPin(Butia.J2, AnalogPin.P2),
    new Butia.ConnectorPin(Butia.J3, AnalogPin.P3),
];

// --- setAngle delegation ---
const servo1 = new MockServoDriver();
const servoRobot1 = new MockRobot(new MockMotorDriver(), servoConfig);
servoRobot1.mockServo(AnalogPin.P1, servo1);

servoRobot1.servoSetAngle(Butia.J1, 0, 45);
assertTest(servo1.angle === 45, "servoSetAngle delegates");

// --- Lazy-loading: second call reuses same servo ---
servoRobot1.servoSetAngle(Butia.J1, 0, 120);
assertTest(servo1.angle === 120, "servo reused on same connector");

// --- Independent servos on different connectors ---
const servo2 = new MockServoDriver();
servoRobot1.mockServo(AnalogPin.P2, servo2);

servoRobot1.servoSetAngle(Butia.J2, 0, 30);
assertTest(servo2.angle === 30 && servo1.angle === 120, "independent servos on different connectors");

basic.showString("ALL PASS servo");
