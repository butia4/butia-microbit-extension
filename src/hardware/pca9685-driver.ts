// Register-level driver for the PCA9685 16-channel I2C PWM chip used as the
// Mapper PCB's servo driver (see docs/pcb_microbit.pdf, sheet "Input
// Output", U10). Address pins A0-A5 and ~OE are tied to VSS on this board,
// so the address is the PCA9685 default (0x40) and outputs are always
// enabled. Confirmed against a reference implementation in
// /workspaces/tesis/i2cservo's edit history (a Kitronik-style PCA9685
// driver for this same board) — this version keeps the same init sequence
// and register map but uses the full 12-bit OFF count instead of that
// reference's single-byte-limited pulse write.

namespace butia {
    const pca9685RegMode1 = 0x00;
    const pca9685RegPrescale = 0xFE;
    const pca9685RegLed0OnL = 0x06;
    const pca9685TicksPerCycle = 4096;
    const pca9685UpdateHz = 50;
    const pca9685OscillatorHz = 25000000;

    // Same pulse timing as the direct-PWM ServoDriver (servo-driver-butia.ts):
    // 20ms period, pulse 500-2500us maps angle 0-180.
    const pca9685PulseMinMicros = 500;
    const pca9685PulseMaxMicros = 2500;

    export class Pca9685Driver {
        private _address: number;
        private _initialized: boolean;

        // PXT only allows numeric/null/boolean literal defaults (TS9212),
        // so the default address is inlined rather than a named constant.
        constructor(address: number = 0x40) {
            this._address = address;
            this._initialized = false;
        }

        init(): void {
            this._writeReg(pca9685RegMode1, 0x10); // SLEEP, so the prescaler can change
            const prescale = Math.round(pca9685OscillatorHz / (pca9685TicksPerCycle * pca9685UpdateHz)) - 1;
            this._writeReg(pca9685RegPrescale, prescale);
            this._writeReg(pca9685RegMode1, 0x20); // wake, auto-increment on
            basic.pause(1); // oscillator stabilization
            this._initialized = true;
        }

        setAngle(channel: number, degrees: number): void {
            if (!this._initialized) this.init();
            const clamped = Math.max(0, Math.min(180, degrees));
            const pulseMicros = pca9685PulseMinMicros + clamped * (pca9685PulseMaxMicros - pca9685PulseMinMicros) / 180;
            const offTicks = Math.round(pulseMicros * pca9685TicksPerCycle / (1000000 / pca9685UpdateHz));

            const buf = pins.createBuffer(5);
            buf.setNumber(NumberFormat.UInt8LE, 0, pca9685RegLed0OnL + 4 * channel);
            buf.setNumber(NumberFormat.UInt8LE, 1, 0); // ON_L
            buf.setNumber(NumberFormat.UInt8LE, 2, 0); // ON_H
            buf.setNumber(NumberFormat.UInt8LE, 3, offTicks & 0xFF);
            buf.setNumber(NumberFormat.UInt8LE, 4, (offTicks >> 8) & 0x0F);
            pins.i2cWriteBuffer(this._address, buf);
        }

        private _writeReg(reg: number, value: number): void {
            const buf = pins.createBuffer(2);
            buf.setNumber(NumberFormat.UInt8LE, 0, reg);
            buf.setNumber(NumberFormat.UInt8LE, 1, value);
            pins.i2cWriteBuffer(this._address, buf);
        }
    }

    export class Pca9685ServoDriver implements IServoDriver {
        constructor(private _driver: Pca9685Driver, private _channel: number) {}
        init(): void {}
        setAngle(degrees: number): void {
            this._driver.setAngle(this._channel, degrees);
        }
        _channelForTest(): number { return this._channel; }
    }
}
