class SimDistanceSensor implements IDistanceSensor {
    _distance: number = -1
    _prevNear: boolean = false

    constructor() {}

    init(): void {}

    getPin(): number { return -1 }

    poll(): void {
        const near = this._distance <= OBSTACLE_STOP_DISTANCE_CM
        if (near === this._prevNear) return
        this._prevNear = near
        control.raiseEvent(BUTIA_EVENT_SOURCE, near ? ButiaEvent.ObstacleNear : ButiaEvent.ObstacleFar)
    }

    setDistance(distance: number): void {
        this._distance = distance
    }

    readCm(): number {
        return this._distance
    }

    read(): number {
        return this.readCm()
    }
}
