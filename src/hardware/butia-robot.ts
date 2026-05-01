// ButiaRobot wires the Butia v4 hardware components.
// Pin assignments are placeholders — pending Butia v4 schematic confirmation.

class ButiaRobot extends Butia.RobotBase{
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
            [new LightSensor(DigitalPin.P1)],
            [new GraySensor(DigitalPin.P2)]
        )           
    }
    start(): void {
        //registerSim()
        super.start()
        //startSendSimLoop()
    }
}

namespace Butia {
    //% fixedInstance whenUsed block="Butia v4"
    export const Butia4_1_0 = new RobotDriver(new ButiaRobot())
}