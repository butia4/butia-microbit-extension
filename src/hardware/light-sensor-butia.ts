namespace Butia {
    export class LightSensor implements ILightSensor {
        private _pinTrigger: DigitalPin | AnalogPin;

        constructor(pinTrigger: DigitalPin|AnalogPin) {
            this._pinTrigger = pinTrigger;
        }

        pin(): number {
            return this._pinTrigger;
        }
        init(): void {}
        read(): number {
            let raw = 1023 - pins.analogReadPin(this._pinTrigger);
            let value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }
}
