interface IRobot {
    start(): void
    moveForward(speed: number, duration?: number): void
    moveBackward(speed: number, duration?: number): void
    turn(direction: TurnDirection, speed: number, duration?: number): void
    motorTank(left: number, right: number): void
    motorStop(): void
    detectLine(id: LineSensorId): boolean
    obstacleDistance(): number
    setAssist(flag: RobotAssist, enabled: boolean): void
}
