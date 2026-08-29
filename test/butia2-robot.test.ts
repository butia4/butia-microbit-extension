// Butia2Robot (Butia v4) wiring: connectors J1-J3 resolve to P0-P2, motors
// resolve to P8/P9 (left) and P11/P12 (right), J4-J6 are unresolvable (pins
// not yet determined).

const v4Config = butia.butiaV4._connectorConfig();

function pinForV4(name: string): AnalogPin | DigitalPin | undefined {
    for (const cp of v4Config) {
        if (cp.connector.name === name) return cp.pin;
    }
    return undefined;
}

assertTest(pinForV4("J1") === AnalogPin.P0, "v4 J1 resolves to P0");
assertTest(pinForV4("J2") === AnalogPin.P1, "v4 J2 resolves to P1");
assertTest(pinForV4("J3") === AnalogPin.P2, "v4 J3 resolves to P2");
assertTest(pinForV4("J4") === undefined, "v4 has no J4 connector wired yet");
assertTest(pinForV4("J5") === undefined, "v4 has no J5 connector wired yet");

assertTest(butia.butiaV4._modelId() === "butiaV4", "v4 modelId is butiaV4");

// --- motor wiring: TB6612FNG, STBY=P13, motor1 dir/pwm=P14/P15, motor2 dir/pwm=P16/P8 ---
const v4Motors = new butia.Butia2Robot().motors() as butia.Tb6612MotorDriver;
assertTest(v4Motors._stbyPin() === DigitalPin.P13, "v4 motor STBY pin is P13");
assertTest(v4Motors._dir1Pin() === DigitalPin.P14, "v4 motor1 dir pin is P14");
assertTest(v4Motors._pwm1Pin() === DigitalPin.P15, "v4 motor1 pwm pin is P15");
assertTest(v4Motors._dir2Pin() === DigitalPin.P16, "v4 motor2 dir pin is P16");
assertTest(v4Motors._pwm2Pin() === DigitalPin.P8, "v4 motor2 pwm pin is P8");

// --- resolving an unwired connector fails (mirrors RobotBase's "not found" behavior) ---
const freshV4 = new butia.Butia2Robot();
let threwOnJ4 = false;
try {
    freshV4.readDistanceSensor(butia.v4.J4);
} catch (e) {
    threwOnJ4 = true;
}
assertTest(threwOnJ4, "v4 fails to resolve J4 (not wired on this model yet)");

basic.showString("ALL PASS butia2-robot");
