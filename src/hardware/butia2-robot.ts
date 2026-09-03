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
                    new ConnectorChannels(v4.J1, gpioAnalog(AnalogPin.P0)),
                    new ConnectorChannels(v4.J2, gpioAnalog(AnalogPin.P1)),
                    new ConnectorChannels(v4.J3, gpioAnalog(AnalogPin.P2)),
                    //TODO: J1-J3 digital channel not wired yet — needs wiring table
                    //TODO: new ConnectorChannels(v4.J4, ...), channels not wired yet — needs wiring table
                    //TODO: new ConnectorChannels(v4.J5, ...), channels not wired yet — needs wiring table
                    //TODO: new ConnectorChannels(v4.J6, ...), channels not wired yet — needs wiring table
                    //TODO: i2c-backed channels

                ],
                "butiaV4");
        }
        start(): void {
            super.start();
        }
    }
    export const butiaV4 = new RobotDriver(new Butia2Robot());
}
