class AnalogLineSensor implements ILineSensor {
    private _pinLeft: AnalogPin
    private _pinRight: AnalogPin
    private _prevLeft: boolean
    private _prevRight: boolean

    constructor(pinLeft: AnalogPin, pinRight: AnalogPin) {
        this._pinLeft = pinLeft
        this._pinRight = pinRight
        this._prevLeft = false
        this._prevRight = false
    }

    init(): void {}

    // Returns a 2-bit field: bit 0 = left sensor active, bit 1 = right sensor active.
    read(): number {
        return (this.readLeft() ? 1 : 0) | (this.readRight() ? 2 : 0)
    }

    readLeft(): boolean {
        return pins.analogReadPin(this._pinLeft) > LINE_THRESHOLD
    }

    readRight(): boolean {
        return pins.analogReadPin(this._pinRight) > LINE_THRESHOLD
    }

    // Fires events only on state transitions — prevents event floods at 50ms poll rate.
    poll(): void {
        const left = this.readLeft()
        const right = this.readRight()

        if (left === this._prevLeft && right === this._prevRight) return

        this._prevLeft = left
        this._prevRight = right

        if (left && right) {
            control.raiseEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineBothDetected)
        } else if (left) {
            control.raiseEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineLeftDetected)
        } else if (right) {
            control.raiseEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineRightDetected)
        } else {
            control.raiseEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineNoneDetected)
        }
    }
}
