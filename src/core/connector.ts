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

    // Id ranges below are offset well clear of AnalogPin/DigitalPin's
    // 100-120 range (see enums.d.ts) so I2c and Gpio channels never collide
    // on the same connectorConfig, and analog/digital I2c ids never collide
    // with each other.
    const i2cAnalogIdBase = 1000;
    const i2cDigitalIdBase = 2000;

    // channel: the ADS1015 ADC channel (0-3) backing this connector's analog role.
    export function i2cAnalog(channel: Ads1015Channel): II2cChannel {
        return { kind: ChannelKind.I2c, id: i2cAnalogIdBase + channel, index: channel };
    }

    // pin: the PCA9536 expander pin (0-3) backing this connector's digital role.
    export function i2cDigital(pin: number): II2cChannel {
        return { kind: ChannelKind.I2c, id: i2cDigitalIdBase + pin, index: pin };
    }
}
