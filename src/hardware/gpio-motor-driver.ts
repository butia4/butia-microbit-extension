class GPIOMotorDriver implements IMotorDriver {

    constructor(
        private leftPins: DigitalPin[],
        private rightPins: DigitalPin[]
    ) {}

    init(): void {}

    setSpeed(left: number, right: number): void {
        this._setMotor(this.leftPins, left);
        this._setMotor(this.rightPins, -right);
    }

    stop(): void {
        this.setSpeed(0, 0);
    }

    private _setMotor(motorPins: DigitalPin[], speed: number): void {  // ← cambiado
        if (speed > 0) {
            pins.digitalWritePin(motorPins[0], 1);
            pins.digitalWritePin(motorPins[1], 0);
        } else if (speed < 0) {
            pins.digitalWritePin(motorPins[0], 0);
            pins.digitalWritePin(motorPins[1], 1);
        } else {
            pins.digitalWritePin(motorPins[0], 0);
            pins.digitalWritePin(motorPins[1], 0);
        }
    }
}
