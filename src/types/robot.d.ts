interface IRobot {
    start(): void
    moveForward(speed: number, duration?: number): void
    moveBackward(speed: number, duration?: number): void
    turn(direction: TurnDirection, speed: number, duration?: number): void
    motorTank(left: number, right: number): void
    motorStop(): void
    setAssist(flag: RobotAssist, enabled: boolean): void
    readDistanceSensor(connector: Connector): number
    readGraySensor(connector: Connector): number
    readLightSensor(connector: Connector): number
    readButton(connector: Connector): boolean
    startMonitoring(sensor: number, pin: number, threshold: number): void
    onLevelReached(sensor: number, pin: number, handler: () => void): void
    onLevelUnreached(sensor: number, pin: number, handler: () => void): void
    startMonitoringButton(pin: number): void
    onButton(pin: number, handler: () => void): void
}

interface IRobotConfig {
    connectorPins: { connector: Connector; pin: DigitalPin }[];
    motorLeftConnectors: Connector[];
    motorRightConnectors: Connector[];
}

interface IRobotRecord {
    model: RobotModel;
    defaultConfig: IRobotConfig;
    build(cfg: IRobotConfig): IRobot;
}
