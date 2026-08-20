declare namespace butia {
    export interface IConnector {
        readonly name: string;
    }

    export interface IConnectorPin {
        readonly connector: IConnector;
        readonly pin: AnalogPin | DigitalPin;
    }

    export interface IRobot {
        start(): void
        moveForward(speed: number, duration?: number): void
        moveBackward(speed: number, duration?: number): void
        turn(direction: ButiaTurnDirection, speed: number, duration?: number): void
        motorTank(left: number, right: number): void
        motorStop(): void
        readDistanceSensor(connector: IConnector): number
        readGraySensor(connector: IConnector): number
        readLightSensor(connector: IConnector): number
        readGenericSensor(connector: IConnector, name: number): number
        readButton(connector: IConnector): boolean
        onDistance(connector: IConnector, op: ButiaComparison, threshold: number, priority:number,handler: () => void): void
        onLight(connector: IConnector, op: ButiaComparison, threshold: number, priority:number,handler: () => void): void
        onGray(connector: IConnector, op: ButiaComparison, threshold: number, priority:number,handler: () => void): void
        onSensorInRange(sensorType: ButiaSensorType, connector: IConnector, min: number, max: number, priority: number, handler: () => void): void
        onConnectorButton(connector: IConnector, state: ButiaButtonState, priority:number,handler: () => void): void
        motorLeft(): number
        motorRight(): number
        servoSetAngle(connector: IConnector, name: number, degrees: number): void
        modelId(): string
        connectorConfig(): IConnectorPin[]
    }
}
