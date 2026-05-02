class SimLineSensor implements ILineSensor {
    _left: number = 0
    _right: number = 0
    _prevLeft: boolean = false
    _prevRight: boolean = false

    constructor() {}

    init(): void {}

    getPin(): number { return -1 }

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

    setReadings(left: number, right: number): void {
        this._left = left
        this._right = right
    }

    readLeft(): boolean {
        return this._left > LINE_THRESHOLD
    }

    readRight(): boolean {
        return this._right > LINE_THRESHOLD
    }

    read(): number {
        return (this.readLeft() ? 1 : 0) | (this.readRight() ? 2 : 0)
    }
}
