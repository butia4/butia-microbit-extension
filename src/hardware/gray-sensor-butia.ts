class GraySensor implements IGraySensor {
    private _lastGray: number;
    private _pinTrigger: DigitalPin;

    constructor(pinTrigger: DigitalPin) {
        this._pinTrigger=pinTrigger;
        this._lastGray = 0;
    }
    
    // Returns the last cached distance — safe to call at any time without triggering hardware.
    getLastValue(): number {
        return this._lastGray;
    }
    getPin(): number{
        return this._pinTrigger;
    }
    read(): number {
        let raw = 1023 - pins.analogReadPin(this._pinTrigger);
        let value = (raw / 1023) * 100;
        return Math.round(value * 10) / 10;
    }
    
    poll(): void {
        control.fail("Method not implemented");
    } 
    init(): void {
        control.fail("Method not implemented");
    }

}
