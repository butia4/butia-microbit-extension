// Butia2Robot (Butia v2) wiring: connectors J1-J3 resolve to P0-P2, motors
// resolve to P8/P9 (left) and P11/P12 (right), J4/J5 are unresolvable.

const v2Config = butia.butiaV2._connectorConfig();

function pinForV2(name: string): AnalogPin | DigitalPin | undefined {
    for (const cp of v2Config) {
        if (cp.connector.name === name) return cp.pin;
    }
    return undefined;
}

assertTest(pinForV2("J1") === AnalogPin.P0, "v2 J1 resolves to P0");
assertTest(pinForV2("J2") === AnalogPin.P1, "v2 J2 resolves to P1");
assertTest(pinForV2("J3") === AnalogPin.P2, "v2 J3 resolves to P2");
assertTest(pinForV2("J4") === undefined, "v2 has no J4 connector");
assertTest(pinForV2("J5") === undefined, "v2 has no J5 connector");

assertTest(butia.butiaV2._modelId() === "butiaV2", "v2 modelId is butiaV2");

// --- motor wiring: left=[P8,P9], right=[P11,P12], no polarity inversion vs v4 ---
const v2Motors = new butia.Butia2Robot().motors() as butia.GpioMotorDriver;
assertTest(
    v2Motors._leftPins()[0] === DigitalPin.P8 && v2Motors._leftPins()[1] === DigitalPin.P9,
    "v2 left motor pins are P8,P9"
);
assertTest(
    v2Motors._rightPins()[0] === DigitalPin.P11 && v2Motors._rightPins()[1] === DigitalPin.P12,
    "v2 right motor pins are P11,P12"
);

// --- resolving an unwired connector fails (mirrors RobotBase's "not found" behavior) ---
const freshV2 = new butia.Butia2Robot();
let threwOnJ4 = false;
try {
    freshV2.readDistanceSensor(butia.J4);
} catch (e) {
    threwOnJ4 = true;
}
assertTest(threwOnJ4, "v2 fails to resolve J4 (not wired on this model)");

basic.showString("ALL PASS butia2-robot");
