// Tests for RobotDriver singleton lifecycle.

butia.RobotDriver.start(butia.butiaV4);
butia.RobotDriver.start(butia.butiaV4); // segunda llamada con la misma instancia debe ser no-op, no crashear

butia.RobotDriver.instance(); // debe retornar sin tirar excepción
basic.showString("PASS singleton");

// --- cross-model mixing is rejected (butiaV4 then butiaV2) ---

butia.RobotDriver._resetForTests();
butia.RobotDriver.start(butia.butiaV4);

let threwOnMixedModelV4ThenV2 = false;
try {
    butia.RobotDriver.start(butia.butiaV2);
} catch (e) {
    threwOnMixedModelV4ThenV2 = true;
}
assertTest(threwOnMixedModelV4ThenV2, "starting butiaV2 after butiaV4 fails (cross-model guard)");

// guard must not have swapped the active instance
assertTest(butia.RobotDriver.instance() === butia.butiaV4, "guard leaves original butiaV4 instance active after rejected mix");

butia.RobotDriver._resetForTests();

// --- cross-model mixing is rejected, symmetric direction (butiaV2 then butiaV4) ---

butia.RobotDriver._resetForTests();
butia.RobotDriver.start(butia.butiaV2);

let threwOnMixedModelV2ThenV4 = false;
try {
    butia.RobotDriver.start(butia.butiaV4);
} catch (e) {
    threwOnMixedModelV2ThenV4 = true;
}
assertTest(threwOnMixedModelV2ThenV4, "starting butiaV4 after butiaV2 fails (cross-model guard, symmetry)");

// guard must not have swapped the active instance
assertTest(butia.RobotDriver.instance() === butia.butiaV2, "guard leaves original butiaV2 instance active after rejected mix");

butia.RobotDriver._resetForTests();

basic.showString("ALL PASS robot");
