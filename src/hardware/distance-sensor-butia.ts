namespace butia {
    export class DistanceSensor implements IDistanceSensor {
        private _pinTrigger: AnalogPin;
        constructor(pinTrigger: AnalogPin) {
            this._pinTrigger = pinTrigger;
        }

        init(): void {}
        read(): number {
            const raw = 1023 - pins.analogReadPin(this._pinTrigger);
            const value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }
}
