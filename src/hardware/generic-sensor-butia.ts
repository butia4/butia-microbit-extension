namespace Butia {
    export class GenericSensor implements IGenericSensor {
        private _pinTrigger: DigitalPin|AnalogPin;
        private _name: number;

        constructor(pinTrigger: DigitalPin|AnalogPin,name: number) {
            this._pinTrigger = pinTrigger;
            this._name = name;
        }

        getName(): number { return this._name; }
        getPin(): number { return this._pinTrigger; }
        init(): void {}
        read(): number {
            let raw = 1023 - pins.analogReadPin(this._pinTrigger);
            let value = (raw / 1023) * 100;
            return Math.round(value * 10) / 10;
        }
    }
}
