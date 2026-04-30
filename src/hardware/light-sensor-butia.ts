class LightSensor implements ILightSensor {
    private _lastLight: number

    constructor(pinTrigger: DigitalPin, pinEcho: DigitalPin) {

        this._lastLight = 0
    }
    

    init(): void {}

    // Returns the last cached distance — safe to call at any time without triggering hardware.
    read(): number {
        return this._lastLight
    }
    poll(): void {
        control.fail("Method not implemented")
    }


    readCm(): number {
        return 1023 - pins.analogReadPin(AnalogPin.P1)
    }

}
