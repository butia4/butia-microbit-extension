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
    readGenericSensor(connector: IConnector, name: number): number
    readButton(connector: IConnector): boolean
    onDistance(connector: IConnector, op: Comparison, threshold: number, priority:number,handler: () => void): void
    onLight(connector: IConnector, op: Comparison, threshold: number, priority:number,handler: () => void): void
    onGray(connector: IConnector, op: Comparison, threshold: number, priority:number,handler: () => void): void
    onConnectorButton(connector: IConnector, state: ButtonState, priority:number,handler: () => void): void
    motorLeft(): number
    motorRight(): number
    servoSetAngle(connector: IConnector, name: number, degrees: number): void
    servoRun(connector: IConnector, name: number, speed: number): void
    servoStop(connector: IConnector, name: number): void
    servoSetPulse(connector: IConnector, name: number, micros: number): void
    servoSetRange(connector: IConnector, name: number, minAngle: number, maxAngle: number): void
    servoSetStopOnNeutral(connector: IConnector, name: number, enabled: boolean): void
}
