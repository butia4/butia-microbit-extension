// butiaV2.motorStopSingle / butiaV4.motorStopSingle stop only ONE motor side,
// leaving the other side running at its current speed. That logic (reading
// motorLeft()/motorRight() and re-issuing motorTank with one side zeroed)
// lives only in the block-wrapper layer (src/blocks/blocks-v2.ts /
// blocks-v4.ts) — RobotBase itself has no equivalent method — so it was
// previously exercised by nothing.
//
// Approach: useMockRobot() (test/_mocks.ts) swaps the real RobotDriver's
// robot for a MockRobot so we can observe the resulting motor state without
// touching real hardware pins. Each block call below is expected to zero
// exactly the requested side and leave the other side unchanged; PASS/FAIL
// reflects whether that held.

// --- Butia v2: stop left, right stays running ---
const mockV2Left = useMockRobot(butia.butiaV2);
mockV2Left.motorTank(50, 60);
butiaV2.motorStopSingle(ButiaMotorSide.Left);
assertTest(
    (mockV2Left.motors() as MockMotorDriver).left === 0 && (mockV2Left.motors() as MockMotorDriver).right === 60,
    "butiaV2.motorStopSingle Left zeroes left, keeps right"
);

// --- Butia v2: stop right, left stays running ---
const mockV2Right = useMockRobot(butia.butiaV2);
mockV2Right.motorTank(50, 60);
butiaV2.motorStopSingle(ButiaMotorSide.Right);
assertTest(
    (mockV2Right.motors() as MockMotorDriver).left === 50 && (mockV2Right.motors() as MockMotorDriver).right === 0,
    "butiaV2.motorStopSingle Right zeroes right, keeps left"
);

// --- Butia v4: stop left, right stays running ---
const mockV4Left = useMockRobot(butia.butiaV4);
mockV4Left.motorTank(-30, 45);
butiaV4.motorStopSingle(ButiaMotorSide.Left);
assertTest(
    (mockV4Left.motors() as MockMotorDriver).left === 0 && (mockV4Left.motors() as MockMotorDriver).right === 45,
    "butiaV4.motorStopSingle Left zeroes left, keeps right"
);

// --- Butia v4: stop right, left stays running ---
const mockV4Right = useMockRobot(butia.butiaV4);
mockV4Right.motorTank(-30, 45);
butiaV4.motorStopSingle(ButiaMotorSide.Right);
assertTest(
    (mockV4Right.motors() as MockMotorDriver).left === -30 && (mockV4Right.motors() as MockMotorDriver).right === 0,
    "butiaV4.motorStopSingle Right zeroes right, keeps left"
);

restoreRealRobots();

basic.showString("ALL PASS motor-stop-single");
