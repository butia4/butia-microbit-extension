class SR04DistanceSensor implements IDistanceSensor {
    private _lastDistance: number
    private _pinTrigger: DigitalPin
    constructor(pinTrigger: DigitalPin) {
        this._pinTrigger=pinTrigger
        this._lastDistance = 0
    }   

    

    // Returns the last cached distance — safe to call at any time without triggering hardware.
    getLastValue(): number {
        return this._lastDistance
    }
    getPin(): number{
        return this._pinTrigger
    }
    poll(): void {
        control.fail("Method not implemented")
    }
    init(): void {
        control.fail("Method not implemented")
    }
    read(): number {

        let adc_value =  pins.analogReadPin(AnalogPin.P1)
        return 9462 / (adc_value - 16)
    }

}
