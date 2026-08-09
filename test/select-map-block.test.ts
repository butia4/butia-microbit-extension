// "Butia v2/v4 use map %map" blocks only select the botsim map now — there is
// no separate "start" block. Each model's blocks (including selectMap) lazily
// auto-start their own RobotDriver on first use, so instance() never fails.
// _resetForTests() clears the singleton between scenarios since
// RobotDriver.start() refuses to swap an already-started instance.

// --- Butia v4: selectMap auto-starts the v4 instance ---
butia.RobotDriver._resetForTests();
butiaV4.selectMap(ButiaSimMap.LineFollower);
assertTest(butia.RobotDriver.instance() === butia.butiaV4, "Butia v4 map block selects the v4 instance");
assertTest(butia.RobotDriver.currentRobot().modelId() === "butiaV4", "active robot after Butia v4 map block has modelId butiaV4");

// --- Butia v2: selectMap auto-starts the v2 instance ---
butia.RobotDriver._resetForTests();
butiaV2.selectMap(ButiaSimMap.LineFollower);
assertTest(butia.RobotDriver.instance() === butia.butiaV2, "Butia v2 map block selects the v2 instance");
assertTest(butia.RobotDriver.currentRobot().modelId() === "butiaV2", "active robot after Butia v2 map block has modelId butiaV2");

// --- any other Butia v2 block auto-starts too, without the map block ---
butia.RobotDriver._resetForTests();
butiaV2.motorStop();
assertTest(butia.RobotDriver.instance() === butia.butiaV2, "using a Butia v2 block without the map block still auto-starts v2");

// Restore v4 as active so later test files in the run (alphabetically after
// this one) that assume an already-started singleton keep working.
butia.RobotDriver._resetForTests();
butia.RobotDriver.start(butia.butiaV4);

basic.showString("ALL PASS select-map-block");
