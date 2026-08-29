// ButiaRobot wires the Butia v2 hardware components.

namespace butia {
    export namespace v2 {
        //% fixedInstances
        export class ButiaV2Connector extends Connector {
            constructor(name: string) { super(name); }
        }

        //% fixedInstance whenUsed block="J1"
        export const J1 = new ButiaV2Connector("J1");
        //% fixedInstance whenUsed block="J2"
        export const J2 = new ButiaV2Connector("J2");
        //% fixedInstance whenUsed block="J3"
        export const J3 = new ButiaV2Connector("J3");
        //% fixedInstance whenUsed block="J4"
        export const J4 = new ButiaV2Connector("J4");
        //% fixedInstance whenUsed block="J5"
        export const J5 = new ButiaV2Connector("J5");
    }

    class ButiaRobot extends RobotBase {
        constructor() {
            super(
                new GpioMotorDriver(
                    [DigitalPin.P13, DigitalPin.P14],
                    [DigitalPin.P15, DigitalPin.P16]
                ),
                [
                    new ConnectorPin(v2.J1, AnalogPin.P1),
                    new ConnectorPin(v2.J2, AnalogPin.P2),
                    new ConnectorPin(v2.J3, AnalogPin.P3),
                    new ConnectorPin(v2.J4, AnalogPin.P4),
                    new ConnectorPin(v2.J5, AnalogPin.P10),
                ],
                "butiaV2");
        }
        start(): void {
            super.start();
        }
    }

    export const butiaV2 = new RobotDriver(new ButiaRobot());
}
