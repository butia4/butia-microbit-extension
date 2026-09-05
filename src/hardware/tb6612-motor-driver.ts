namespace butia {
    export interface Tb6612Pins {
        stby: DigitalPin;
        dir1: DigitalPin;
        pwm1: DigitalPin;
        dir2: DigitalPin;
        pwm2: DigitalPin;
    }
    export class Tb6612MotorDriver implements IMotorDriver {
        private _started: boolean;

        constructor(private pins: Tb6612Pins) {
            this._started = false;
        }

        init(): void {
            pins.digitalWritePin(this.pins.stby, 1);
            this._started = true;
        }

        setSpeed(left: number, right: number): void {
            if (!this._started) this.init();
            this._setMotor(this.pins.dir1, this.pins.pwm1, left);
            this._setMotor(this.pins.dir2, this.pins.pwm2, -right);
        }

        stop(): void {
            this.setSpeed(0, 0);
        }

        // Test-only accessors — expose the wired pins so tests can verify
        _stbyPin(): DigitalPin { return this.pins.stby; }
        _dir1Pin(): DigitalPin { return this.pins.dir1; }
        _pwm1Pin(): DigitalPin { return this.pins.pwm1; }
        _dir2Pin(): DigitalPin { return this.pins.dir2; }
        _pwm2Pin(): DigitalPin { return this.pins.pwm2; }

        private _setMotor(dirPin: DigitalPin, pwmPin: DigitalPin, speed: number): void {
            const value = Math.min(maxMotorSpeed, Math.max(-maxMotorSpeed, speed));
            const pwm = Math.floor(Math.abs(value) * 1023 / 100);

            pins.digitalWritePin(dirPin, value < 0 ? 0 : 1);
            pins.analogWritePin(pwmPin, pwm);
        }
    }
}
