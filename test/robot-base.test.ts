// RobotBase model plumbing: modelId()/connectorConfig()/motors() getters,
// and RobotDriver's delegation to the active robot.

const cfgRB: butia.ConnectorChannels[] = [
    new butia.ConnectorChannels(butia.v2.J1, butia.gpioAnalog(AnalogPin.P1), butia.gpioDigital(DigitalPin.P1)),
];
const motorsRB = new MockMotorDriver();

// --- modelId defaults to "unknown" when omitted (backward compatible ctor) ---
const rbDefault = new butia.RobotBase(motorsRB, cfgRB);
assertTest(rbDefault.modelId() === "unknown", "RobotBase modelId defaults to 'unknown' when omitted");

// --- modelId is exposed when provided ---
const rbCustom = new butia.RobotBase(motorsRB, cfgRB, "butiaV9");
assertTest(rbCustom.modelId() === "butiaV9", "RobotBase exposes provided modelId");

// --- connectorConfig getter exposes the wiring table ---
const cfg = rbCustom.connectorConfig();
assertTest(
    cfg.length === 1 && cfg[0].connector.name === "J1" && cfg[0].analog !== undefined && cfg[0].analog.id === (AnalogPin.P1 as number),
    "RobotBase connectorConfig() exposes wiring table"
);

// --- motors getter exposes the injected motor driver ---
assertTest(rbCustom.motors() === motorsRB, "RobotBase motors() exposes injected driver");

// --- RobotDriver delegates _connectorConfig()/_modelId() to the active robot ---
const driverUnderTest = new butia.RobotDriver(rbCustom);
assertTest(driverUnderTest._connectorConfig() === cfg, "RobotDriver._connectorConfig() delegates to active robot");
assertTest(driverUnderTest._modelId() === "butiaV9", "RobotDriver._modelId() delegates to active robot");

basic.showString("ALL PASS robot-base");
