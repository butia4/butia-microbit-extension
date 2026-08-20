// Sensor wrappers for the Mapper PCB's I2C-backed connectors. Light/gray/
// generic/distance sensors read through the ADS1015 (analog voltage), and
// buttons read through the PCA9536 (digital). The mV-to-percent conversion
// reuses the same 0-1023 formulas as the direct-pin sensors (light-sensor-
// butia.ts etc.) so calibration stays consistent across models; mV is
// rescaled against the 3V3_in rail those connectors are powered from.

namespace butia {
    const ads1015FullScaleMillivolts = 3300;

    function ads1015ToRaw10Bit(mv: number): number {
        const raw = Math.round(mv * 1023 / ads1015FullScaleMillivolts);
        return Math.max(0, Math.min(1023, raw));
    }

    export class Ads1015PercentSensor implements ILightSensor, IGraySensor, IGenericSensor {
        constructor(private _driver: Ads1015Driver, private _channel: number) {}
        init(): void {}
        read(): number {
            const raw = ads1015ToRaw10Bit(this._driver.readMillivolts(this._channel));
            const value = ((1023 - raw) / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }

    export class Ads1015DistanceSensor implements IDistanceSensor {
        constructor(private _driver: Ads1015Driver, private _channel: number) {}
        init(): void {}
        read(): number {
            const raw = ads1015ToRaw10Bit(this._driver.readMillivolts(this._channel));
            return 9462 / (raw - 16);
        }
    }

    export class Pca9536ButtonSensor implements IButtonSensor {
        constructor(private _driver: Pca9536Driver, private _pin: number) {}
        init(): void {}
        read(): number { return this._driver.readPin(this._pin) ? 1 : 0; }
    }
}
