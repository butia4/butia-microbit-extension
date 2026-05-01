// ButiaRobot wires the Butia v4 hardware components.
// Pin assignments are placeholders — pending Butia v4 schematic confirmation.

class ButiaRobot extends RobotBase{
    constructor() {
        super(
            new GPIOMotorDriver(
                [DigitalPin.P13, DigitalPin.P14],
                [DigitalPin.P15, DigitalPin.P16]
            ),
            new SR04DistanceSensor(DigitalPin.P8),
            new LightSensor(DigitalPin.P8)
        )
    }
    start(): void {
        //registerSim()
        super.start()
        //startSendSimLoop()
    }
}
const robot = new ButiaRobot()