// ButiaMapperRobot wires the "Mapper" PCB (docs/pcb_microbit.pdf) hardware.
//
// Unlike v2/v4, this board's sensor connectors are not direct microbit GPIO:
// N1/N2/N3 each carry one PCA9536 digital pin (PDx_ext) and one ADS1015
// analog channel (PIN_AD_x), reached over the microbit's default I2C bus
// (P19/P20 — SCL/SDA on the "microbit edge" sheet). The motor driver is a
// TB6612FNG on direct GPIO (see tb6612-motor-driver.ts).
//
// Pin table confirmed against the schematic's "Input Output" sheet
// (io.kicad_sch) and the "microbit edge" pin list:
//   N1 -> PCA9536 P2 (PD0_ext), ADS1015 AIN0 (PIN_AD_0)
//   N2 -> PCA9536 P1 (PD1_ext), ADS1015 AIN1 (PIN_AD_1)
//   N3 -> PCA9536 P0 (PD2_ext), ADS1015 AIN2 (PIN_AD_2)
//   (PCA9536 P0/P1/P2 cross-wire to PD2_ext/PD1_ext/PD0_ext — not sequential)
//   Motors (TB6612FNG): STBY=P13, left DIR=P14 PWM=P15, right DIR=P16 PWM=P8
//
// N1/N2/N3 also each carry one servo channel (PWM1/PWM2/PWM3), which run
// through a PCA9685 I2C PWM chip (U10), not direct microbit PWM — confirmed
// against the "Servo driver" sheet: LED0/1/2 -> PWM3/PWM2/PWM1 (same
// crossover direction as the PCA9536), A0-A5/~OE tied to VSS so the address
// is the PCA9685 default (0x40).

namespace butia {
    export class ButiaMapperConnector extends Connector {
        constructor(name: string) { super(name); }
    }

    //% fixedInstance whenUsed block="N1"
    export const N1 = new ButiaMapperConnector("N1");
    //% fixedInstance whenUsed block="N2"
    export const N2 = new ButiaMapperConnector("N2");
    //% fixedInstance whenUsed block="N3"
    export const N3 = new ButiaMapperConnector("N3");

    // Connector index (the ConnectorPin.pin value used internally) -> ADS1015
    // channel / PCA9536 pin / PCA9685 servo channel. See header comment for
    // the confirmed crossover — all three share the same P2/P1/P0 direction.
    export const mapperAdsChannelByIndex = [0, 1, 2];
    export const mapperPcaPinByIndex = [2, 1, 0];
    export const mapperServoChannelByIndex = [2, 1, 0];

    export class ButiaMapperRobot extends RobotBase {
        private _pca9536: Pca9536Driver;
        private _ads1015: Ads1015Driver;
        private _pca9685: Pca9685Driver;

        constructor() {
            super(
                new Tb6612MotorDriver(
                    DigitalPin.P13,
                    DigitalPin.P14, DigitalPin.P15,
                    DigitalPin.P16, DigitalPin.P8
                ),
                [
                    new ConnectorPin(N1, 0 as AnalogPin),
                    new ConnectorPin(N2, 1 as AnalogPin),
                    new ConnectorPin(N3, 2 as AnalogPin),
                ],
                "butiaMapper");
            this._pca9536 = new Pca9536Driver();
            this._ads1015 = new Ads1015Driver();
            this._pca9685 = new Pca9685Driver();
        }

        start(): void {
            this._pca9536.init();
            this._ads1015.init();
            this._pca9685.init();
            this.motors().init();
            super.start();
        }

        protected _newLightSensor(pin: AnalogPin | DigitalPin): ILightSensor {
            return new Ads1015PercentSensor(this._ads1015, mapperAdsChannelByIndex[pin as number]);
        }
        protected _newGraySensor(pin: AnalogPin | DigitalPin): IGraySensor {
            return new Ads1015PercentSensor(this._ads1015, mapperAdsChannelByIndex[pin as number]);
        }
        protected _newGenericSensor(name: number, pin: AnalogPin | DigitalPin): IGenericSensor {
            return new Ads1015PercentSensor(this._ads1015, mapperAdsChannelByIndex[pin as number]);
        }
        protected _newDistanceSensor(pin: AnalogPin | DigitalPin): IDistanceSensor {
            return new Ads1015DistanceSensor(this._ads1015, mapperAdsChannelByIndex[pin as number]);
        }
        protected _newButtonSensor(pin: AnalogPin | DigitalPin): IButtonSensor {
            return new Pca9536ButtonSensor(this._pca9536, mapperPcaPinByIndex[pin as number]);
        }
        protected _newServoDriver(name: number, pin: AnalogPin | DigitalPin): IServoDriver {
            return new Pca9685ServoDriver(this._pca9685, mapperServoChannelByIndex[pin as number]);
        }
    }

    export const butiaMapper = new RobotDriver(new ButiaMapperRobot());
}
