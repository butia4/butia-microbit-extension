namespace butia {
    export class DistanceSensor implements IDistanceSensor {
        private _pinTrigger: AnalogPin;
        constructor(pinTrigger: AnalogPin) {
            this._pinTrigger = pinTrigger;
        }

        init(): void {}
        read(): number {
            const adcValue = pins.analogReadPin(this._pinTrigger);
            return 9462 / (adcValue - 16);
        }
    }
}
