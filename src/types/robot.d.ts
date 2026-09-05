declare namespace butia {
    export interface IConnector {
        readonly name: string;
    }

    // How a channel is physically reached.
    export const enum ChannelKind {
        Gpio = 0,
        I2c = 1,
    }

    // Common numeric identity used for caching/claim-tracking and for
    // event-monitor subId computation.
    export interface IChannel {
        readonly kind: ChannelKind;
        readonly id: number;
    }

    export interface IGpioChannel extends IChannel {
        readonly kind: ChannelKind.Gpio;
        readonly pin: AnalogPin | DigitalPin;
    }

    // A channel reached through an I2C expander chip rather than a direct pin.
    // `index` is the sub-channel on that shared peripheral (e.g. an ADS1015
    // ADC channel 0-3, or a PCA9536 GPIO pin 0-3).
    export interface II2cChannel extends IChannel {
        readonly kind: ChannelKind.I2c;
        readonly index: number;
    }

    export interface IConnectorChannels {
        readonly connector: IConnector;
        readonly analog?: IChannel;   // distance/light/gray/generic sensors + servo
        readonly digital?: IChannel;  // button
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
        onConnectorButton(connector: IConnector, state: ButiaButtonState, priority:number,handler: () => void): void
        motorLeft(): number
        motorRight(): number
        servoSetAngle(connector: IConnector, name: number, degrees: number): void
        modelId(): string
        connectorConfig(): IConnectorChannels[]
    }
}
