namespace Butia {
    export class DistanceSensor implements IDistanceSensor {
        private _pinTrigger: DigitalPin|AnalogPin;
        constructor(pinTrigger: DigitalPin|AnalogPin) {
            this._pinTrigger = pinTrigger;
        }

        init(): void {}
        read(): number {
            const adcValue = pins.analogReadPin(this._pinTrigger as number as AnalogPin);
            return 9462 / (adcValue - 16);
        }
    }
}
