namespace Butia {
    // Servo PWM: 20ms period, pulse 500-2500µs maps angle 0-180°.
    const SERVO_PERIOD_US = 20000;
    const SERVO_PULSE_MIN = 500;
    const SERVO_PULSE_MAX = 2500;

    function angleToPwm(angle: number): number {
        const pulse = SERVO_PULSE_MIN + angle * (SERVO_PULSE_MAX - SERVO_PULSE_MIN) / 180;
        return Math.round(pulse * 1023 / SERVO_PERIOD_US);
    }

    function pulseToPwm(micros: number): number {
        return Math.round(micros * 1023 / SERVO_PERIOD_US);
    }

    export class ServoDriver implements IServoDriver {
        private _pin: AnalogPin;
        private _name: number;
        private _minAngle: number;
        private _maxAngle: number;
        private _stopOnNeutral: boolean;
        private _started: boolean;

        constructor(pin: AnalogPin | DigitalPin, name: number) {
            this._pin = pin as AnalogPin;
            this._name = name;
            this._minAngle = 0;
            this._maxAngle = 180;
            this._stopOnNeutral = false;
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
            const clamped = Math.max(this._minAngle, Math.min(this._maxAngle, degrees));
            if (this._stopOnNeutral && clamped === 90) {
                this.stop();
                return;
            }
            this._ensurePeriod();
            pins.analogWritePin(this._pin, angleToPwm(clamped));
        }

        run(speed: number): void {
            const clamped = Math.max(-100, Math.min(100, speed));
            if (this._stopOnNeutral && clamped === 0) {
                this.stop();
                return;
            }
            // Map speed (-100..100) → angle (0..180) where 90 = stopped
            const angle = Math.round(90 + (clamped * 90) / 100);
            this._ensurePeriod();
            pins.analogWritePin(this._pin, angleToPwm(angle));
        }

        stop(): void {
            pins.analogWritePin(this._pin, 0);
            this._started = false;
        }

        setPulse(micros: number): void {
            const clamped = Math.max(SERVO_PULSE_MIN, Math.min(SERVO_PULSE_MAX, micros));
            this._ensurePeriod();
            pins.analogWritePin(this._pin, pulseToPwm(clamped));
        }

        setRange(minAngle: number, maxAngle: number): void {
            this._minAngle = Math.max(0, Math.min(90, minAngle));
            this._maxAngle = Math.max(90, Math.min(180, maxAngle));
        }

        setStopOnNeutral(enabled: boolean): void {
            this._stopOnNeutral = enabled;
        }
    }
}
