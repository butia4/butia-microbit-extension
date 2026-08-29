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
                    new ConnectorPin(v4.J1, AnalogPin.P0),
                    new ConnectorPin(v4.J2, AnalogPin.P1),
                    new ConnectorPin(v4.J3, AnalogPin.P2),
                    //TODO: new ConnectorPin(v4.J4, ...), pin not yet determined
                    //TODO: new ConnectorPin(v4.J5, ...), pin not yet determined
                    //TODO: new ConnectorPin(v4.J6, ...), pin not yet determined
                    //TODO: i2c connectors

                ],
                "butiaV4");
        }
        start(): void {
            super.start();
        }
    }
    export const butiaV4 = new RobotDriver(new Butia2Robot());
}
