// Tests for the PXT simulator bridge (pxt-sim-bridge change).
// Note: SimButtonSensor.read() returns number (0 or 1), not boolean,
// because IButtonSensor extends ISensor whose read() returns number.

// TASK-T01: SimState.reset() clears all fields
SimState.runId = "abc";
SimState.sensorCache["J1"] = 5;
SimState.reset();
assertTest(SimState.runId === "", "sim-state-reset-runid");
assertTest(SimState.sensorCache["J1"] === undefined, "sim-state-reset-cache");

// TASK-T02: buildButiaStateMessage encodes motor values correctly (SC-01)
SimState.reset();
SimState.runId = "r1";
const msg02 = JSON.parse(buildButiaStateMessage(-100, 50, {}, "r1"));
assertTest(msg02.type === "state", "sim-motor-msg-type");
assertTest(msg02.motorLeft === -100, "sim-motor-msg-left");
assertTest(msg02.motorRight === 50, "sim-motor-msg-right");
assertTest(msg02.id === "r1", "sim-motor-msg-id");

// TASK-T03: buildButiaStateMessage encodes active sensors (SC-02)
const sensors03 = { "J2": "distance", "J5": "gray" };
const msg03 = JSON.parse(buildButiaStateMessage(0, 0, sensors03, "r1"));
assertTest(msg03.sensors["J2"] === "distance", "sim-motor-sensors-j2");
assertTest(msg03.sensors["J5"] === "gray", "sim-motor-sensors-j5");

// TASK-T04: SimMotorDriver.setSpeed() updates SimState.sensorTypeMap lazily (SC-09)
SimState.reset();
SimState.runId = "r2";
const driver04 = new SimMotorDriver(() => ({ "J3": "light" }));
driver04.setSpeed(10, 20);
assertTest(SimState.sensorTypeMap["J3"] === "light", "sim-motor-setspeed-updates-typemap");
driver04.setSpeed(30, 40);
assertTest(SimState.sensorTypeMap["J3"] === "light", "sim-motor-stable-typemap");

// TASK-T05: SimDistanceSensor.read() returns -1 when cache absent (SC-05)
SimState.reset();
const sensor05 = new SimDistanceSensor("J3", AnalogPin.P3);
assertTest(sensor05.read() === -1, "sim-distance-read-empty");

// TASK-T06: SimDistanceSensor.read() returns cached value (SC-04)
SimState.sensorCache["J2"] = 45;
const sensor06 = new SimDistanceSensor("J2", AnalogPin.P2);
assertTest(sensor06.read() === 45, "sim-distance-read-cached");

// TASK-T07: SimGraySensor.read() empty and cached
SimState.reset();
const sensor07a = new SimGraySensor("J5", AnalogPin.P10);
assertTest(sensor07a.read() === -1, "sim-gray-read-empty");
SimState.sensorCache["J5"] = 78;
assertTest(sensor07a.read() === 78, "sim-gray-read-cached");

// TASK-T08: SimLightSensor.read() empty and cached
SimState.reset();
const sensor08 = new SimLightSensor("J1", AnalogPin.P1);
assertTest(sensor08.read() === -1, "sim-light-read-empty");
SimState.sensorCache["J1"] = 55;
assertTest(sensor08.read() === 55, "sim-light-read-cached");

// TASK-T09: SimButtonSensor.read() returns 1 when cache is 1 (SC-06)
SimState.reset();
SimState.sensorCache["J4"] = 1;
const sensor09 = new SimButtonSensor("J4", DigitalPin.P4);
assertTest(sensor09.read() === 1, "sim-button-pressed");

// TASK-T10: SimButtonSensor.read() returns 0 when cache is 0 (SC-07)
SimState.sensorCache["J4"] = 0;
assertTest(sensor09.read() === 0, "sim-button-released");

// TASK-T11: SimButtonSensor.read() returns 0 when connector absent (SC-08)
SimState.reset();
assertTest(sensor09.read() === 0, "sim-button-absent");

// TASK-T12: applyButiaSensorsMessage updates cache for matching runId (SC-03)
SimState.reset();
SimState.runId = "r3";
applyButiaSensorsMessage(JSON.stringify({ type: "sensors", id: "r3", values: { "J2": 45, "J5": 78 } }));
assertTest(SimState.sensorCache["J2"] === 45, "sim-incoming-updates-j2");
assertTest(SimState.sensorCache["J5"] === 78, "sim-incoming-updates-j5");

// TASK-T13: applyButiaSensorsMessage ignores stale runId
SimState.reset();
SimState.runId = "r4";
applyButiaSensorsMessage(JSON.stringify({ type: "sensors", id: "r1-stale", values: { "J2": 99 } }));
assertTest(SimState.sensorCache["J2"] === undefined, "sim-incoming-stale-ignored");

// TASK-T14: ButiaSimRobot._buildSensorTypeMap() after sensor registration
SimState.reset();
const simRobot = new Butia.ButiaSimRobot();
simRobot.readDistanceSensor(Butia.J2);
simRobot.readGraySensor(Butia.J5);
const typeMap = simRobot._buildSensorTypeMap();
assertTest(typeMap["J2"] === "distance", "sim-robot-map-j2");
assertTest(typeMap["J5"] === "gray", "sim-robot-map-j5");

basic.showString("ALL PASS sim-bridge");
