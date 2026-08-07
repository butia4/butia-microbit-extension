// Tests for the PXT simulator bridge (pxt-sim-bridge change).
// Note: SimButtonSensor.read() returns number (0 or 1), not boolean,
// because IButtonSensor extends ISensor whose read() returns number.

// TASK-T01: Butia.simState.reset() clears all fields
Butia.simState.runId = "abc";
Butia.simState.sensorCache["J1"] = 5;
Butia.simState.reset();
assertTest(Butia.simState.runId === "", "sim-state-reset-runid");
assertTest(Butia.simState.sensorCache["J1"] === undefined, "sim-state-reset-cache");

// TASK-T02: buildStateMessage encodes motor values correctly (SC-01)
Butia.simState.reset();
Butia.simState.runId = "r1";
const msg02 = JSON.parse(Butia.buildStateMessage(-100, 50, {}, "r1"));
assertTest(msg02.type === "state", "sim-motor-msg-type");
assertTest(msg02.motorLeft === -100, "sim-motor-msg-left");
assertTest(msg02.motorRight === 50, "sim-motor-msg-right");
assertTest(msg02.id === "r1", "sim-motor-msg-id");

// TASK-T03: buildStateMessage encodes active sensors (SC-02)
const sensors03 = { "J2": "distance", "J5": "gray" };
const msg03 = JSON.parse(Butia.buildStateMessage(0, 0, sensors03, "r1"));
assertTest(msg03.sensors["J2"] === "distance", "sim-motor-sensors-j2");
assertTest(msg03.sensors["J5"] === "gray", "sim-motor-sensors-j5");

// TASK-T04: SimMotorDriver.setSpeed() updates Butia.simState.sensorTypeMap lazily (SC-09)
Butia.simState.reset();
Butia.simState.runId = "r2";
const driver04 = new Butia.SimMotorDriver(() => ({ "J3": "light" }));
driver04.setSpeed(10, 20);
assertTest(Butia.simState.sensorTypeMap["J3"] === "light", "sim-motor-setspeed-updates-typemap");
driver04.setSpeed(30, 40);
assertTest(Butia.simState.sensorTypeMap["J3"] === "light", "sim-motor-stable-typemap");

// TASK-T05: SimDistanceSensor.read() returns -1 when cache absent (SC-05)
Butia.simState.reset();
const sensor05 = new Butia.SimDistanceSensor("J3", AnalogPin.P3);
assertTest(sensor05.read() === -1, "sim-distance-read-empty");

// TASK-T06: SimDistanceSensor.read() returns cached value (SC-04)
Butia.simState.sensorCache["J2"] = 45;
const sensor06 = new Butia.SimDistanceSensor("J2", AnalogPin.P2);
assertTest(sensor06.read() === 45, "sim-distance-read-cached");

// TASK-T07: SimGraySensor.read() empty and cached
Butia.simState.reset();
const sensor07a = new Butia.SimGraySensor("J5", AnalogPin.P10);
assertTest(sensor07a.read() === -1, "sim-gray-read-empty");
Butia.simState.sensorCache["J5"] = 78;
assertTest(sensor07a.read() === 78, "sim-gray-read-cached");

// TASK-T08: SimLightSensor.read() empty and cached
Butia.simState.reset();
const sensor08 = new Butia.SimLightSensor("J1", AnalogPin.P1);
assertTest(sensor08.read() === -1, "sim-light-read-empty");
Butia.simState.sensorCache["J1"] = 55;
assertTest(sensor08.read() === 55, "sim-light-read-cached");

// TASK-T09: SimButtonSensor.read() returns 1 when cache is 1 (SC-06)
Butia.simState.reset();
Butia.simState.sensorCache["J4"] = 1;
const sensor09 = new Butia.SimButtonSensor("J4", DigitalPin.P4);
assertTest(sensor09.read() === 1, "sim-button-pressed");

// TASK-T10: SimButtonSensor.read() returns 0 when cache is 0 (SC-07)
Butia.simState.sensorCache["J4"] = 0;
assertTest(sensor09.read() === 0, "sim-button-released");

// TASK-T11: SimButtonSensor.read() returns 0 when connector absent (SC-08)
Butia.simState.reset();
assertTest(sensor09.read() === 0, "sim-button-absent");

// TASK-T12: applySensorsMessage updates cache for matching runId (SC-03)
Butia.simState.reset();
Butia.simState.runId = "r3";
Butia.applySensorsMessage(JSON.stringify({ type: "sensors", id: "r3", values: { "J2": 45, "J5": 78 } }));
assertTest(Butia.simState.sensorCache["J2"] === 45, "sim-incoming-updates-j2");
assertTest(Butia.simState.sensorCache["J5"] === 78, "sim-incoming-updates-j5");

// TASK-T13: applySensorsMessage ignores stale runId
Butia.simState.reset();
Butia.simState.runId = "r4";
Butia.applySensorsMessage(JSON.stringify({ type: "sensors", id: "r1-stale", values: { "J2": 99 } }));
assertTest(Butia.simState.sensorCache["J2"] === undefined, "sim-incoming-stale-ignored");

// TASK-T14: ButiaSimRobot._buildSensorTypeMap() after sensor registration
Butia.simState.reset();
const simRobot = new Butia.ButiaSimRobot();
simRobot.readDistanceSensor(Butia.J2);
simRobot.readGraySensor(Butia.J5);
const typeMap = simRobot._buildSensorTypeMap();
assertTest(typeMap["J2"] === "distance", "sim-robot-map-j2");
assertTest(typeMap["J5"] === "gray", "sim-robot-map-j5");

// TASK-T15: buildMapSelectMessage encodes type and id correctly (no port fields)
const msg15 = JSON.parse(Butia.buildMapSelectMessage(1));
assertTest(msg15.type === "mapselect", "sim-mapselect-msg-type");
assertTest(msg15.id === 1, "sim-mapselect-msg-id");
assertTest(msg15.leftPort === undefined, "sim-mapselect-msg-no-left-port");
assertTest(msg15.rightPort === undefined, "sim-mapselect-msg-no-right-port");

// TASK-T16: _simSelectMap is idempotent — only the first call records id
Butia.simState.reset();
assertTest(!Butia.simState.mapSelected, "sim-mapselect-initial-unset");
assertTest(Butia.simState.selectedMapId === 0, "sim-mapselect-initial-id-unset");
Butia._simSelectMap(1);
assertTest(Butia.simState.mapSelected, "sim-mapselect-sets-flag");
assertTest(Butia.simState.selectedMapId === 1, "sim-mapselect-records-id");
Butia._simSelectMap(2);
assertTest(Butia.simState.selectedMapId === 1, "sim-mapselect-repeat-noop");

// TASK-T17: Butia.simState.reset() clears mapSelected and selectedMapId
Butia.simState.mapSelected = true;
Butia.simState.selectedMapId = 1;
Butia.simState.reset();
assertTest(!Butia.simState.mapSelected, "sim-state-reset-mapselected");
assertTest(Butia.simState.selectedMapId === 0, "sim-state-reset-selected-map-id");

// TASK-T18: mid-run resend loop always carries the selected map id once set —
// buildMapSelectMessage no longer carries port fields at all.
Butia.simState.reset();
Butia._simSelectMap(2);
const msg18 = JSON.parse(Butia.buildMapSelectMessage(Butia.simState.selectedMapId));
assertTest(msg18.id === 2, "sim-mapselect-resend-id");

basic.showString("ALL PASS sim-bridge");
