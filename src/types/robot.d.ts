interface IConnector {
    readonly name: string;
}

interface IConnectorPin {
    readonly connector: IConnector;
    readonly pin: AnalogPin | DigitalPin;
}

interface IRobot {
    start(): void
    moveForward(speed: number, duration?: number): void
    moveBackward(speed: number, duration?: number): void
    turn(direction: TurnDirection, speed: number, duration?: number): void
    motorTank(left: number, right: number): void
    motorStop(): void
    readDistanceSensor(connector: IConnector): number
    readGraySensor(connector: IConnector): number
    readLightSensor(connector: IConnector): number
    onDistanceLessThan(connector: IConnector, threshold: number, handler: () => void): void
}
