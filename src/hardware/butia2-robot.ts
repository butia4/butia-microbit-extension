namespace butia {
    export namespace v4 {
        //% fixedInstances
        export class ButiaV4Connector extends Connector {
            constructor(name: string) { super(name); }
        }

        //% fixedInstance whenUsed block="J1"
        export const J1 = new ButiaV4Connector("J1");
        //% fixedInstance whenUsed block="J2"
        export const J2 = new ButiaV4Connector("J2");
        //% fixedInstance whenUsed block="J3"
        export const J3 = new ButiaV4Connector("J3");
        //% fixedInstance whenUsed block="J4"
        export const J4 = new ButiaV4Connector("J4");
        //% fixedInstance whenUsed block="J5"
        export const J5 = new ButiaV4Connector("J5");
        //% fixedInstance whenUsed block="J6"
        export const J6 = new ButiaV4Connector("J6");
    }

    export class Butia2Robot extends RobotBase {
        // Wiring table: J1-J3 analog is a direct pin, digital goes through
        // the PCA9536 (I2C). J4/J6 analog goes through the ADS1015 (I2C),
        // digital is a direct pin. J5 is I2C on both roles.
        private _pca9536: Pca9536IoExpander;
        private _ads1015: Ads1015Adc;

        constructor() {
            super(
                new Tb6612MotorDriver({
                    stby: DigitalPin.P13,
                    dir1: DigitalPin.P14,
                    pwm1: DigitalPin.P15,
                    dir2: DigitalPin.P16,
                    pwm2: DigitalPin.P8
                }),
                [
                    new ConnectorChannels(v4.J1, gpioAnalog(AnalogPin.P0), i2cDigital(2)),
                    new ConnectorChannels(v4.J2, gpioAnalog(AnalogPin.P1), i2cDigital(1)),
                    new ConnectorChannels(v4.J3, gpioAnalog(AnalogPin.P2), i2cDigital(0)),
                    new ConnectorChannels(v4.J4, i2cAnalog(Ads1015Channel.Ain2), gpioDigital(DigitalPin.P9)),
                    new ConnectorChannels(v4.J5, i2cAnalog(Ads1015Channel.Ain1), i2cDigital(3)),
                    new ConnectorChannels(v4.J6, i2cAnalog(Ads1015Channel.Ain0), gpioDigital(DigitalPin.P12)),
                ],
                "butiaV4");
            this._pca9536 = new Pca9536IoExpander();
            this._ads1015 = new Ads1015Adc();
            this._ads1015.setGain(Ads1015Gain.Fsr4_096V);
        }

        start(): void {
            super.start();
            this._pca9536.init();
        }

        protected _newLightSensor(channel: IChannel): ILightSensor {
            if (channel.kind === ChannelKind.I2c) {
                return new I2cLightSensor(this._ads1015, (channel as II2cChannel).index);
            }
            return super._newLightSensor(channel);
        }

        protected _newGraySensor(channel: IChannel): IGraySensor {
            if (channel.kind === ChannelKind.I2c) {
                return new I2cGraySensor(this._ads1015, (channel as II2cChannel).index);
            }
            return super._newGraySensor(channel);
        }

        protected _newDistanceSensor(channel: IChannel): IDistanceSensor {
            if (channel.kind === ChannelKind.I2c) {
                return new I2cDistanceSensor(this._ads1015, (channel as II2cChannel).index);
            }
            return super._newDistanceSensor(channel);
        }

        protected _newGenericSensor(name: number, channel: IChannel): IGenericSensor {
            if (channel.kind === ChannelKind.I2c) {
                return new I2cGenericSensor(this._ads1015, (channel as II2cChannel).index, name);
            }
            return super._newGenericSensor(name, channel);
        }

        protected _newButtonSensor(channel: IChannel): IButtonSensor {
            if (channel.kind === ChannelKind.I2c) {
                return new I2cButtonSensor(this._pca9536, (channel as II2cChannel).index);
            }
            return super._newButtonSensor(channel);
        }
    }
    export const butiaV4 = new RobotDriver(new Butia2Robot());
}
