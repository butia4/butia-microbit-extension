namespace butia {
    //% fixedInstances
    export class Connector implements IConnector {
        constructor(public readonly name: string) {}
    }

    export class ConnectorChannels implements IConnectorChannels {
        constructor(
            public readonly connector: IConnector,
            public readonly analog?: IChannel,
            public readonly digital?: IChannel
        ) {}
    }

    export function gpioAnalog(pin: AnalogPin): IGpioChannel {
        return { kind: ChannelKind.Gpio, id: pin as number, pin };
    }

    export function gpioDigital(pin: DigitalPin): IGpioChannel {
        return { kind: ChannelKind.Gpio, id: pin as number, pin };
    }
}
