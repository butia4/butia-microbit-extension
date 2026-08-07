namespace Butia {
    // Servo PWM: 20ms period, pulse 500-2500µs maps angle 0-180°.
    const SERVO_PERIOD_US = 20000;
    const SERVO_PULSE_MIN = 500;
    const SERVO_PULSE_MAX = 2500;

    function angleToPwm(angle: number): number {
        const pulse = SERVO_PULSE_MIN + angle * (SERVO_PULSE_MAX - SERVO_PULSE_MIN) / 180;
        return Math.round(pulse * 1023 / SERVO_PERIOD_US);
    }

    export class ServoDriver implements IServoDriver {
        private _pin: AnalogPin;
        private _started: boolean;

        // name is part of the shared servo-driver factory signature but unused here.
        constructor(pin: AnalogPin | DigitalPin, name: number) {
            this._pin = pin as AnalogPin;
            this._started = false;
        }

        init(): void {}

        private _ensurePeriod(): void {
            if (!this._started) {
                pins.analogSetPeriod(this._pin, SERVO_PERIOD_US);
                this._started = true;
            }
        }

        setAngle(degrees: number): void {
            const clamped = Math.max(0, Math.min(180, degrees));
            this._ensurePeriod();
            pins.analogWritePin(this._pin, angleToPwm(clamped));
        }
    }
}
