// ButiaRobot wires the Butia v4 hardware components.
// Pin assignments are placeholders — pending Butia v4 schematic confirmation.

class ButiaRobot extends RobotBase{
    constructor() {
        super(
            new GPIOMotorDriver(
                [DigitalPin.P13, DigitalPin.P14],
                [DigitalPin.P15, DigitalPin.P16]
            ),
            {
                J1: AnalogPin.P1,
                J2: AnalogPin.P2,
                J3: AnalogPin.P3,
                J4: AnalogPin.P4,
                J5: AnalogPin.P10,            
            } ,
            [new SR04DistanceSensor(DigitalPin.P8)],
            [new LightSensor(DigitalPin.P1)]
        )           
    }
    start(): void {
        //registerSim()
        super.start()
        //startSendSimLoop()
    }
}
const robot = new ButiaRobot()