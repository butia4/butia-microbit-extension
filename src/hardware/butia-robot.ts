// ButiaRobot wires the Butia v4 hardware components.
// Pin assignments are placeholders — pending Butia v4 schematic confirmation.

class ButiaRobot extends RobotBase {
    constructor() {
        super(
            new I2CMotorDriver(0x10),
            new AnalogLineSensor(AnalogPin.P1, AnalogPin.P2),
            new SR04DistanceSensor(DigitalPin.P13, DigitalPin.P14)
        )
    }

    start(): void {
        registerSim()
        super.start()
        startSendSimLoop()
    }
}

const robot = new ButiaRobot()
