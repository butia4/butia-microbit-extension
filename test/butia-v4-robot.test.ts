// ButiaV4Robot (Butia v4) wiring: J1-J3 analog is a direct pin (P0-P2), digital
// goes through the PCA9536 (I2C pins 2/1/0). J4/J6 analog goes through the
// ADS1015 (I2C AIN2/AIN0), digital is a direct pin (P9/P12). J5 is I2C on
// both roles (AIN1 / PCA9536 pin 3).

const v4Config = butia.butiaV4._connectorConfig();

type ConnectorRole = "analog" | "digital";

function channelForV4(name: string, role: ConnectorRole): butia.IChannel | undefined {
    for (const cp of v4Config) {
        if (cp.connector.name === name) {
            return role === "analog" ? cp.analog : cp.digital;
        }
    }
    return undefined;
}

function pinForV4(name: string, role: ConnectorRole): AnalogPin | DigitalPin | undefined {
    const channel = channelForV4(name, role);
    return channel && channel.kind === butia.ChannelKind.Gpio ? (channel as butia.IGpioChannel).pin : undefined;
}

function i2cIndexForV4(name: string, role: ConnectorRole): number | undefined {
    const channel = channelForV4(name, role);
    return channel && channel.kind === butia.ChannelKind.I2c ? (channel as butia.II2cChannel).index : undefined;
}

// --- J1-J3: analog direct pin, digital via PCA9536 ---
assertTest(pinForV4("J1", "analog") === AnalogPin.P0, "v4 J1 analog resolves to P0");
assertTest(pinForV4("J2", "analog") === AnalogPin.P1, "v4 J2 analog resolves to P1");
assertTest(pinForV4("J3", "analog") === AnalogPin.P2, "v4 J3 analog resolves to P2");
assertTest(i2cIndexForV4("J1", "digital") === 2, "v4 J1 digital resolves to PCA9536 pin 2 (I2C)");
assertTest(i2cIndexForV4("J2", "digital") === 1, "v4 J2 digital resolves to PCA9536 pin 1 (I2C)");
assertTest(i2cIndexForV4("J3", "digital") === 0, "v4 J3 digital resolves to PCA9536 pin 0 (I2C)");

// --- J4/J6: analog via ADS1015, digital direct pin ---
assertTest(i2cIndexForV4("J4", "analog") === butia.Ads1015Channel.Ain2, "v4 J4 analog resolves to ADS1015 AIN2 (I2C)");
assertTest(pinForV4("J4", "digital") === DigitalPin.P9, "v4 J4 digital resolves to P9");
assertTest(i2cIndexForV4("J6", "analog") === butia.Ads1015Channel.Ain0, "v4 J6 analog resolves to ADS1015 AIN0 (I2C)");
assertTest(pinForV4("J6", "digital") === DigitalPin.P12, "v4 J6 digital resolves to P12");

// --- J5: I2C on both roles ---
assertTest(i2cIndexForV4("J5", "analog") === butia.Ads1015Channel.Ain1, "v4 J5 analog resolves to ADS1015 AIN1 (I2C)");
assertTest(i2cIndexForV4("J5", "digital") === 3, "v4 J5 digital resolves to PCA9536 pin 3 (I2C)");

assertTest(butia.butiaV4._modelId() === "butiaV4", "v4 modelId is butiaV4");

// --- motor wiring: TB6612FNG, STBY=P13, motor1 dir/pwm=P14/P15, motor2 dir/pwm=P16/P8 ---
const v4Motors = new butia.ButiaV4Robot().motors() as butia.Tb6612MotorDriver;
assertTest(v4Motors._stbyPin() === DigitalPin.P13, "v4 motor STBY pin is P13");
assertTest(v4Motors._dir1Pin() === DigitalPin.P14, "v4 motor1 dir pin is P14");
assertTest(v4Motors._pwm1Pin() === DigitalPin.P15, "v4 motor1 pwm pin is P15");
assertTest(v4Motors._dir2Pin() === DigitalPin.P16, "v4 motor2 dir pin is P16");
assertTest(v4Motors._pwm2Pin() === DigitalPin.P8, "v4 motor2 pwm pin is P8");

// --- every connector/role introduced by the real wiring table actually
// resolves to a working sensor (I2C-backed or direct pin), on a fresh robot
// each time so connector claims from one assertion don't collide with another ---
function assertNoThrow(fn: () => void, label: string): void {
    let threw = false;
    try {
        fn();
    } catch (e) {
        threw = true;
    }
    assertTest(!threw, label);
}

assertNoThrow(() => new butia.ButiaV4Robot().readDistanceSensor(butia.v4.J4), "v4 J4 distance sensor resolves via I2C (ADS1015 AIN2)");
assertNoThrow(() => new butia.ButiaV4Robot().readLightSensor(butia.v4.J5), "v4 J5 light sensor resolves via I2C (ADS1015 AIN1)");
assertNoThrow(() => new butia.ButiaV4Robot().readGraySensor(butia.v4.J6), "v4 J6 gray sensor resolves via I2C (ADS1015 AIN0)");
assertNoThrow(() => new butia.ButiaV4Robot().readGenericSensor(butia.v4.J4, 0), "v4 J4 generic sensor resolves via I2C (ADS1015 AIN2)");
assertNoThrow(() => new butia.ButiaV4Robot().readButton(butia.v4.J1), "v4 J1 button resolves via I2C (PCA9536 pin 2)");
assertNoThrow(() => new butia.ButiaV4Robot().readButton(butia.v4.J5), "v4 J5 button resolves via I2C (PCA9536 pin 3)");
assertNoThrow(() => new butia.ButiaV4Robot().readButton(butia.v4.J4), "v4 J4 button resolves via direct pin P9");
assertNoThrow(() => new butia.ButiaV4Robot().readButton(butia.v4.J6), "v4 J6 button resolves via direct pin P12");

basic.showString("ALL PASS butia-v4-robot");
