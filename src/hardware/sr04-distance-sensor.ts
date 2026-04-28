class SR04DistanceSensor implements IDistanceSensor {
    private _pinTrigger: DigitalPin
    private _pinEcho: DigitalPin
    private _prevNear: boolean
    private _lastDistance: number

    constructor(pinTrigger: DigitalPin, pinEcho: DigitalPin) {
        this._pinTrigger = pinTrigger
        this._pinEcho = pinEcho
        this._prevNear = false
        this._lastDistance = MAX_DISTANCE_CM
    }

    init(): void {}

    // Returns the last cached distance — safe to call at any time without triggering hardware.
    read(): number {
        return this._lastDistance
    }

    private _measurePulse(): number {
        pins.digitalWritePin(this._pinTrigger, 0)
        control.waitMicros(2)
        pins.digitalWritePin(this._pinTrigger, 1)
        control.waitMicros(10)
        pins.digitalWritePin(this._pinTrigger, 0)
        return pins.pulseIn(this._pinEcho, PulseValue.High, 23200)
    }

    readCm(): number {
        const pulseMicros = this._measurePulse()
        const distanceCm = pulseMicros > 0 ? pulseMicros / 58 : MAX_DISTANCE_CM
        this._lastDistance = distanceCm < MAX_DISTANCE_CM ? distanceCm : MAX_DISTANCE_CM
        return this._lastDistance
    }

    // Fires ObstacleNear / ObstacleFar only on near↔far transitions.
    poll(): void {
        const distanceCm = this.readCm()
        const near = distanceCm <= OBSTACLE_STOP_DISTANCE_CM

        if (near === this._prevNear) return

        this._prevNear = near
        control.raiseEvent(BUTIA_EVENT_SOURCE, near ? ButiaEvent.ObstacleNear : ButiaEvent.ObstacleFar)
    }
}
