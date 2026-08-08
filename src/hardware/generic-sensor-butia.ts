namespace butia {
    export class GenericSensor implements IGenericSensor {
        private _pinTrigger: DigitalPin|AnalogPin;

        // name is part of the shared sensor factory signature but unused here.
        constructor(pinTrigger: DigitalPin|AnalogPin, name: number) {
            this._pinTrigger = pinTrigger;
        }

        init(): void {}
        read(): number {
            let raw = 1023 - pins.analogReadPin(this._pinTrigger);
            let value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }
}
