// Motor driver for the TB6612FNG H-bridge used on the Mapper PCB. Each motor
// takes one DIR pin and one PWM pin; the complementary H-bridge input is
// generated in hardware by a 74AHC1G04 inverter (see docs/pcb_microbit.pdf,
// sheet "Input Output", U12/U13), so only one direction pin per motor is
// needed here — unlike GpioMotorDriver's two-pin-per-motor scheme. STBY is
// shared across both motors and must be driven high to leave standby.

namespace butia {
    export class Tb6612MotorDriver implements IMotorDriver {

        constructor(
            private standbyPin: DigitalPin,
            private leftDirPin: DigitalPin,
            private leftPwmPin: DigitalPin,
            private rightDirPin: DigitalPin,
            private rightPwmPin: DigitalPin
        ) {}

        init(): void {
            pins.digitalWritePin(this.standbyPin, 1);
        }

        setSpeed(left: number, right: number): void {
            this._setMotor(this.leftDirPin, this.leftPwmPin, left);
            this._setMotor(this.rightDirPin, this.rightPwmPin, -right);
        }

        stop(): void {
            this.setSpeed(0, 0);
        }

        // Test-only accessors — mirror GpioMotorDriver's pattern so tests can
        // verify wiring without invoking real hardware pin I/O.
        _standbyPin(): DigitalPin { return this.standbyPin; }
        _leftPins(): DigitalPin[] { return [this.leftDirPin, this.leftPwmPin]; }
        _rightPins(): DigitalPin[] { return [this.rightDirPin, this.rightPwmPin]; }

        private _setMotor(dirPin: DigitalPin, pwmPin: DigitalPin, speed: number): void {
            const clamped = Math.min(maxMotorSpeed, Math.max(-maxMotorSpeed, speed));
            pins.digitalWritePin(dirPin, clamped < 0 ? 0 : 1);
            const pwm = Math.floor(Math.abs(clamped) * 1023 / 100);
            pins.analogWritePin(pwmPin, pwm);
        }
    }
}
