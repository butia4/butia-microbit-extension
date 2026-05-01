interface IRobot {
    start(): void
    moveForward(speed: number, duration?: number): void
    moveBackward(speed: number, duration?: number): void
    turn(direction: TurnDirection, speed: number, duration?: number): void
    motorTank(left: number, right: number): void
    motorStop(): void
    setAssist(flag: RobotAssist, enabled: boolean): void
    readDistanceSensor(pin: number): number
    readGraySensor(pin: number): number
    readLightSensor(pin: number): number
    readButton(pin: number): boolean
    startMonitoring(sensor: number, pin: number, threshold: number): void
    onLevelReached(sensor: number, pin: number, handler: () => void): void
    onLevelUnreached(sensor: number, pin: number, handler: () => void): void
    startMonitoringButton(pin: number): void
    onButton(pin: number, handler: () => void): void
}
