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
    readButton(connector: IConnector): boolean
    onDistance(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void
    onLight(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void
    onGray(connector: IConnector, op: Comparison, threshold: number, handler: () => void): void
    onConnectorButton(connector: IConnector, state: ButtonState, handler: () => void): void
    resolveWhile(sensor: ReactiveSensorType,connector: IConnector, op: Comparison, threshold: number, action: ReactiveAction, target: MotorTarget, speed: number): void
    //whileGray(connector: IConnector, op: Comparison, threshold: number, action: ReactiveAction, target: MotorTarget, speed: number): void
    //whileDistance(connector: IConnector, op: Comparison, threshold: number, action: ReactiveAction, target: MotorTarget, speed: number): void
    //whileLight(connector: IConnector, op: Comparison, threshold: number, action: ReactiveAction, target: MotorTarget, speed: number): void
    //whileButton(connector: IConnector, state: ButtonState, action: ReactiveAction, target: MotorTarget, speed: number): void
    //whileGrayLineLossWithClearPath(grayConnector: IConnector, grayThreshold: number, distanceConnector: IConnector, clearDistance: number, target: MotorTarget): void
    //whileArcAround(connector: IConnector, op: Comparison, threshold: number, side: ArcSide, speed: number): void
    //stopReactiveMode(): void
    motorLeft(): number
    motorRight(): number
}
