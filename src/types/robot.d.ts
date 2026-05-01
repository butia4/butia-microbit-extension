interface IRobot {
    start(): void
    moveForward(speed: number, duration?: number): void
    moveBackward(speed: number, duration?: number): void
    turn(direction: TurnDirection, speed: number, duration?: number): void
    motorTank(left: number, right: number): void
    motorStop(): void
    setAssist(flag: RobotAssist, enabled: boolean): void
    readDistanceSensor(pin: string): number
    readGraySensor(pin: string): number
    readLightSensor(pin: string): number
    readButton(pin: string): boolean
    startMonitoring(sensor: number, pin: number, threshold: number): void
    onLevelReached(sensor: number, pin: number, handler: () => void): void
    onLevelUnreached(sensor: number, pin: number, handler: () => void): void
    startMonitoringButton(pin: number): void
    onButton(pin: number, handler: () => void): void
}
