namespace butia {
    export class GpioMotorDriver implements IMotorDriver {

        constructor(
            private leftPins: DigitalPin[],
            private rightPins: DigitalPin[]
        ) {}

        init(): void {}

        setSpeed(left: number, right: number): void {
            if (this.leftPins.length === 0 || this.rightPins.length === 0)
                control.fail("Motor pins not configured.");
            this._setMotor(this.leftPins, left);
            this._setMotor(this.rightPins, -right);
        }

        stop(): void {
            this.setSpeed(0, 0);
        }

        // Test-only accessors — expose the wired pins so tests can verify
        // per-model wiring without invoking real hardware pin I/O.
        _leftPins(): DigitalPin[] { return this.leftPins; }
        _rightPins(): DigitalPin[] { return this.rightPins; }

        private _setMotor(motorPins: DigitalPin[], speed: number): void {
            const value = Math.min(maxMotorSpeed, Math.max(-maxMotorSpeed, speed));
            const pwm = Math.floor(Math.abs(value) * 1023 / 100);

            if (value > 0) {
                pins.digitalWritePin(motorPins[1], 0);
                pins.analogWritePin(motorPins[0], pwm);

            } else if (value < 0) {
                pins.digitalWritePin(motorPins[0], 0);
                pins.analogWritePin(motorPins[1], pwm);

            } else {
                pins.digitalWritePin(motorPins[0], 0);
                pins.digitalWritePin(motorPins[1], 0);
            }
        }
    }
}
