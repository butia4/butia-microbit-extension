class DistanceSensor implements IDistanceSensor {
    private _pinTrigger: DigitalPin|AnalogPin;
    constructor(pinTrigger: DigitalPin|AnalogPin) {
        this._pinTrigger = pinTrigger;
    }

    getPin(): number {
        return this._pinTrigger;
    }
    init(): void {}
    read(): number {
        // Discard first read: flushes SAR ADC capacitor after channel switch.
        // Without this, residual charge from the previously-sampled pin biases
        // this channel by ~30-40 ADC units (hardware-verified cross-talk).
        pins.analogReadPin(this._pinTrigger as number as AnalogPin);
        const adc_value = pins.analogReadPin(this._pinTrigger as number as AnalogPin);
        const dist = 9462 / (adc_value - 16);
        Butia._log("dist", "pin=" + this._pinTrigger + " adc=" + adc_value + " cm=" + dist);
        return dist;
    }
}
