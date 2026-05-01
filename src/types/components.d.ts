interface IRobotComponent {
    init(): void
}

interface ISensor extends IRobotComponent {
    read(): number
}

interface IPolledSensor extends ISensor {
    poll(): void
}

interface ILineSensor extends IPolledSensor {
    readLeft(): boolean
    readRight(): boolean
}

interface IDistanceSensor extends IPolledSensor {

}

interface ILightSensor extends IPolledSensor {

}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IActuator extends IRobotComponent {}

declare namespace Buffer {
    function fromUTF8(str: string): Buffer
}

interface IMotorDriver extends IActuator {
    setSpeed(left: number, right: number): void
    stop(): void
}
