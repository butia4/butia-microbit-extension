// Butia3Robot (Butia v3) wiring: connectors J1-J3 resolve to P0-P2, motors
// resolve to P8/P9 (left) and P11/P12 (right), J4/J5 are unresolvable.

const v3Config = butia.butiaV3._connectorConfig();

function pinForV3(name: string): AnalogPin | DigitalPin | undefined {
    for (const cp of v3Config) {
        if (cp.connector.name === name) return cp.pin;
    }
    return undefined;
}

assertTest(pinForV3("J1") === AnalogPin.P0, "v3 J1 resolves to P0");
assertTest(pinForV3("J2") === AnalogPin.P1, "v3 J2 resolves to P1");
assertTest(pinForV3("J3") === AnalogPin.P2, "v3 J3 resolves to P2");
assertTest(pinForV3("J4") === undefined, "v3 has no J4 connector");
assertTest(pinForV3("J5") === undefined, "v3 has no J5 connector");

assertTest(butia.butiaV3._modelId() === "butiaV3", "v3 modelId is butiaV3");

// --- motor wiring: left=[P8,P9], right=[P11,P12], no polarity inversion vs v4 ---
const v3Motors = new butia.Butia3Robot().motors() as butia.GpioMotorDriver;
assertTest(
    v3Motors._leftPins()[0] === DigitalPin.P8 && v3Motors._leftPins()[1] === DigitalPin.P9,
    "v3 left motor pins are P8,P9"
);
assertTest(
    v3Motors._rightPins()[0] === DigitalPin.P11 && v3Motors._rightPins()[1] === DigitalPin.P12,
    "v3 right motor pins are P11,P12"
);

// --- resolving an unwired connector fails (mirrors RobotBase's "not found" behavior) ---
const freshV3 = new butia.Butia3Robot();
let threwOnJ4 = false;
try {
    freshV3.readDistanceSensor(butia.J4);
} catch (e) {
    threwOnJ4 = true;
}
assertTest(threwOnJ4, "v3 fails to resolve J4 (not wired on this model)");

basic.showString("ALL PASS butia3-robot");
