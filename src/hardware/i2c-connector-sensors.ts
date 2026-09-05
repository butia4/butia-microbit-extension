// Adapters that let RobotBase's existing ISensor/IButtonSensor factories read
// through the PCA9536/ADS1015 I2C expanders instead of a direct micro:bit pin.
// Each class mirrors its GPIO counterpart's formula exactly — only the raw
// reading source changes.

namespace butia {
    // micro:bit's native analogReadPin maps 0-VCC to 0-1023.
    const microbitAdcRefMillivolts = 3300;
    const microbitAdcResolution = 1023;

    // Each ADS1015 conversion is single-shot (~3-4ms, dominated by the fixed
    // settling pause in Ads1015Adc.readRaw), so there's no free running
    // average on the chip — averaging means taking that many separate
    // readings. 5 samples (~15-20ms per sensor read) smooths out the IR
    // distance sensor's noise without eating too much of EventMonitor's
    // 50ms polling budget.
    const analogSampleCount = 5;

    function averagedMillivolts(adc: Ads1015Adc, channel: Ads1015Channel): number {
        let total = 0;
        for (let i = 0; i < analogSampleCount; i++) {
            total += adc.readMillivolts(channel);
        }
        return total / analogSampleCount;
    }

    // Converts an averaged ADS1015 reading to the 0-1023 code the micro:bit's
    // native analogReadPin would have reported for the same voltage, so every
    // formula below can stay identical to its GPIO counterpart. Must go
    // through millivolts (not a raw-code ratio) because the ADS1015's raw
    // code range depends on its configured PGA gain, which has nothing to
    // do with the micro:bit ADC's fixed ~3.3V/1023-code scale.
    function nativeEquivalentRaw(adc: Ads1015Adc, channel: Ads1015Channel): number {
        const millivolts = Math.max(0, averagedMillivolts(adc, channel));
        return Math.round((millivolts / microbitAdcRefMillivolts) * microbitAdcResolution);
    }

    export class I2cButtonSensor implements IButtonSensor {
        // pin: the PCA9536 expander pin (0-3) wired to this connector.
        constructor(private _expander: Pca9536IoExpander, private _pin: number) {}

        init(): void {}
        read(): number { return this._expander.readPin(this._pin) ? 1 : 0; }
    }

    export class I2cLightSensor implements ILightSensor {
        // channel: the ADS1015 ADC channel (0-3) wired to this connector.
        constructor(private _adc: Ads1015Adc, private _channel: Ads1015Channel) {}

        init(): void {}
        read(): number {
            const raw = 1023 - nativeEquivalentRaw(this._adc, this._channel);
            const value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }

    export class I2cGraySensor implements IGraySensor {
        constructor(private _adc: Ads1015Adc, private _channel: Ads1015Channel) {}

        init(): void {}
        read(): number {
            const raw = 1023 - nativeEquivalentRaw(this._adc, this._channel);
            const value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }

    export class I2cDistanceSensor implements IDistanceSensor {
        constructor(private _adc: Ads1015Adc, private _channel: Ads1015Channel) {}

        init(): void {}
        read(): number {
            const adcValue = nativeEquivalentRaw(this._adc, this._channel);
            return 9462 / (adcValue - 16);
        }
    }

    export class I2cGenericSensor implements IGenericSensor {
        // name is part of the shared sensor factory signature but unused here.
        constructor(private _adc: Ads1015Adc, private _channel: Ads1015Channel, name: number) {}

        init(): void {}
        read(): number {
            const raw = 1023 - nativeEquivalentRaw(this._adc, this._channel);
            const value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }
}
