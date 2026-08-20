// ButiaMapperRobot wiring: N1/N2/N3 connectors resolve to opaque indices
// 0/1/2 (dispatched internally to ADS1015 channels / PCA9536 pins, not real
// microbit pins), motors resolve to the TB6612FNG's STBY/DIR/PWM pins.

const mapperConfig = butia.butiaMapper._connectorConfig();

function pinForMapper(name: string): AnalogPin | DigitalPin | undefined {
    for (const cp of mapperConfig) {
        if (cp.connector.name === name) return cp.pin;
    }
    return undefined;
}

assertTest(pinForMapper("N1") === (0 as AnalogPin), "mapper N1 resolves to index 0");
assertTest(pinForMapper("N2") === (1 as AnalogPin), "mapper N2 resolves to index 1");
assertTest(pinForMapper("N3") === (2 as AnalogPin), "mapper N3 resolves to index 2");
assertTest(pinForMapper("J1") === undefined, "mapper has no J1 connector (that's v2/v4's)");

assertTest(butia.butiaMapper._modelId() === "butiaMapper", "mapper modelId is butiaMapper");

// --- motor wiring: STBY=P13, left=[DIR P14, PWM P15], right=[DIR P16, PWM P8] ---
const mapperMotors = new butia.Tb6612MotorDriver(
    DigitalPin.P13,
    DigitalPin.P14, DigitalPin.P15,
    DigitalPin.P16, DigitalPin.P8
);
assertTest(mapperMotors._standbyPin() === DigitalPin.P13, "mapper STBY pin is P13");
assertTest(
    mapperMotors._leftPins()[0] === DigitalPin.P14 && mapperMotors._leftPins()[1] === DigitalPin.P15,
    "mapper left motor pins are DIR=P14, PWM=P15"
);
assertTest(
    mapperMotors._rightPins()[0] === DigitalPin.P16 && mapperMotors._rightPins()[1] === DigitalPin.P8,
    "mapper right motor pins are DIR=P16, PWM=P8"
);

// --- resolving an unwired connector fails (mirrors RobotBase's "not found" behavior) ---
const freshMapper = new butia.ButiaMapperRobot();
let threwOnJ1 = false;
try {
    freshMapper.readDistanceSensor(butia.J1);
} catch (e) {
    threwOnJ1 = true;
}
assertTest(threwOnJ1, "mapper fails to resolve J1 (not wired on this model)");

// --- N1/N2/N3 -> ADS1015 channel / PCA9536 pin / PCA9685 servo channel crossover ---
assertTest(
    butia.mapperAdsChannelByIndex[0] === 0 && butia.mapperAdsChannelByIndex[1] === 1 && butia.mapperAdsChannelByIndex[2] === 2,
    "mapper ADS1015 channels are sequential (N1=AIN0, N2=AIN1, N3=AIN2)"
);
assertTest(
    butia.mapperPcaPinByIndex[0] === 2 && butia.mapperPcaPinByIndex[1] === 1 && butia.mapperPcaPinByIndex[2] === 0,
    "mapper PCA9536 pins cross-wire (N1=P2, N2=P1, N3=P0)"
);
assertTest(
    butia.mapperServoChannelByIndex[0] === 2 && butia.mapperServoChannelByIndex[1] === 1 && butia.mapperServoChannelByIndex[2] === 0,
    "mapper PCA9685 servo channels cross-wire the same direction (N1=LED2/PWM1, N2=LED1/PWM2, N3=LED0/PWM3)"
);

// --- servoSetAngle now resolves through the PCA9685 driver without throwing ---
let servoThrew = false;
try {
    freshMapper.servoSetAngle(butia.N1, 0, 90);
} catch (e) {
    servoThrew = true;
}
assertTest(!servoThrew, "mapper servoSetAngle works on a wired connector");

basic.showString("ALL PASS butia-mapper-robot");
