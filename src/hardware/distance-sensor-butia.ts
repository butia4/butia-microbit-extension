class DistanceSensor implements IDistanceSensor {
    private _lastDistance: number;
    private _pinTrigger: DigitalPin|AnalogPin;
    constructor(pinTrigger: DigitalPin|AnalogPin) {
        this._pinTrigger = pinTrigger;
        this._lastDistance = 0;
    }

    // Returns the last cached distance — safe to call at any time without triggering hardware.
    getLastValue(): number {
        return this._lastDistance;
    }
    getPin(): number {
        return this._pinTrigger;
    }
    poll(): void {
        control.fail("Method not implemented");
    }
    init(): void {
        control.fail("Method not implemented");
    }
    read(): number {
        const adc_value = pins.analogReadPin(this._pinTrigger as number as AnalogPin);
        return 9462 / (adc_value - 16);
    }
}
