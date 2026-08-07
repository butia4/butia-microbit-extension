namespace butia {
    // Servo PWM: 20ms period, pulse 500-2500µs maps angle 0-180°.
    const servoPeriodMicros = 20000;
    const servoPulseMin = 500;
    const servoPulseMax = 2500;

    function angleToPwm(angle: number): number {
        const pulse = servoPulseMin + angle * (servoPulseMax - servoPulseMin) / 180;
        return Math.round(pulse * 1023 / servoPeriodMicros);
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
                pins.analogSetPeriod(this._pin, servoPeriodMicros);
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
