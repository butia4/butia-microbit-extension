// "start robot %robot use map %map" block: explicit v2/v4 selection, and the
// required-block error when no selection was made.
// _resetForTests() clears the singleton between scenarios since
// RobotDriver.start() refuses to swap an already-started instance.

// --- explicit v4 selection ---
butia.RobotDriver._resetForTests();
butia.startRobot(butia.butiaV4, ButiaSimMap.LineFollower);
assertTest(butia.RobotDriver.instance() === butia.butiaV4, "start robot butiaV4 selects the v4 instance");
assertTest(butia.RobotDriver.currentRobot().modelId() === "butiaV4", "active robot after explicit v4 select has modelId butiaV4");

// --- explicit v2 selection ---
butia.RobotDriver._resetForTests();
butia.startRobot(butia.butiaV2, ButiaSimMap.LineFollower);
assertTest(butia.RobotDriver.instance() === butia.butiaV2, "start robot butiaV2 selects the v2 instance");
assertTest(butia.RobotDriver.currentRobot().modelId() === "butiaV2", "active robot after explicit v2 select has modelId butiaV2");

// --- no selection block: instance() must fail, not silently default ---
butia.RobotDriver._resetForTests();
let threwWithoutStart = false;
try {
    butia.RobotDriver.instance();
} catch (e) {
    threwWithoutStart = true;
}
assertTest(threwWithoutStart, "instance() fails when no start robot block was used");

// Restore v4 as active so later test files in the run (alphabetically after
// this one) that assume an already-started singleton keep working.
butia.RobotDriver.start(butia.butiaV4);

basic.showString("ALL PASS start-robot-block");
