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
    setAssist(flag: RobotAssist, enabled: boolean): void
    readDistanceSensor(connector: IConnector): number
    readGraySensor(connector: IConnector): number
    readLightSensor(connector: IConnector): number
    readButton(connector: IConnector): boolean
    startMonitoring(sensor: number, pin: number, threshold: number): void
    onLevelReached(sensor: number, pin: number, handler: () => void): void
    onLevelUnreached(sensor: number, pin: number, handler: () => void): void
    startMonitoringButton(pin: number): void
    onButton(pin: number, handler: () => void): void
}
