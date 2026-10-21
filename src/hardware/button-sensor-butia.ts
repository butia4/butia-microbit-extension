namespace butia {
    export class ButtonSensor implements IButtonSensor {
        private _pin: DigitalPin;

        constructor(pin: DigitalPin) {
            this._pin = pin;
        }

        isPressed(): boolean { return pins.digitalReadPin(this._pin) === 1; }
    }
}
