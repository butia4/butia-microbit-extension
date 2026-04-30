class SR04DistanceSensor implements IDistanceSensor {
    private _lastDistance: number

    constructor(pinTrigger: DigitalPin, pinEcho: DigitalPin) {

        this._lastDistance = 0
    }
    

    init(): void {}

    // Returns the last cached distance — safe to call at any time without triggering hardware.
    read(): number {
        return this._lastDistance
    }
    poll(): void {
        control.fail("Method not implemented")
    }


    readCm(): number {

        let adc_value =  pins.analogReadPin(AnalogPin.P1)
        return 9462 / (adc_value - 16)
    }

}
