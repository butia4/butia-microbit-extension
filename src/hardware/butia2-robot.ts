// Butia2Robot wires the Butia v2 hardware components.
// v2 reuses the existing J1/J2/J3 connector fixedInstances (defined in
// butia-robot.ts) mapped to different pins — _resolvePin matches by
// connector name against each robot instance's own _connectorConfig, so no
// new connector fixedInstances are needed and blocks stay identical across
// models.

namespace butia {
    export class Butia2Robot extends RobotBase {
        constructor() {
            super(
                new GpioMotorDriver(
                    [DigitalPin.P8, DigitalPin.P9],
                    [DigitalPin.P11, DigitalPin.P12]
                ),
                [
                    new ConnectorPin(J1, AnalogPin.P0),
                    new ConnectorPin(J2, AnalogPin.P1),
                    new ConnectorPin(J3, AnalogPin.P2),
                ],
                "butiaV2");
        }
        start(): void {
            super.start();
        }
    }

    export const butiaV2 = new RobotDriver(new Butia2Robot());
}
