// I2C 4-channel analog-to-digital converter used to add extra analog inputs
// beyond the micro:bit's own pins. Butia v4 connectors that aren't wired to
// a direct GPIO pin resolve through here instead.

namespace butia {
    const ADS1015_REG_CONVERSION = 0x00;
    const ADS1015_REG_CONFIG = 0x01;

    // Programmable gain amplifier full-scale ranges.
    export const enum Ads1015Gain {
        Fsr6_144V = 0x0000,
        Fsr4_096V = 0x0200,
        Fsr2_048V = 0x0400,
        Fsr1_024V = 0x0600,
        Fsr0_512V = 0x0800,
        Fsr0_256V = 0x0A00,
    }

    export const enum Ads1015Channel {
        Ain0 = 0,
        Ain1 = 1,
        Ain2 = 2,
        Ain3 = 3,
    }

    export class Ads1015Adc {
        private _gain: Ads1015Gain;

        constructor(private _address: number = 0x48) {
            this._gain = Ads1015Gain.Fsr2_048V;
        }

        private _writeRegister(reg: number, value: number): void {
            const buf = pins.createBuffer(3);
            buf.setNumber(NumberFormat.UInt8LE, 0, reg);
            buf.setNumber(NumberFormat.UInt8LE, 1, (value >> 8) & 0xFF);
            buf.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF);
            pins.i2cWriteBuffer(this._address, buf, false);
        }

        private _readRegister16(reg: number): number {
            const regBuf = pins.createBuffer(1);
            regBuf.setNumber(NumberFormat.UInt8LE, 0, reg);
            pins.i2cWriteBuffer(this._address, regBuf, true);
            return pins.i2cReadBuffer(this._address, 2, false).getNumber(NumberFormat.UInt16BE, 0);
        }

        // Voltage range used for subsequent readMillivolts() conversions.
        setGain(gain: Ads1015Gain): void {
            this._gain = gain;
        }

        // Reads a single-ended channel and returns the signed 12-bit raw ADC value.
        readRaw(channel: Ads1015Channel): number {
            // MUX for single-ended: AIN0=100, AIN1=101, AIN2=110, AIN3=111 (bits 14-12)
            const muxBits = (0x04 + channel) << 12;

            let config = 0x8000;          // OS=1, start conversion
            config = config | muxBits;    // select channel
            config = config | this._gain; // gain
            config = config | 0x0100;     // MODE=1, single-shot
            config = config | 0x0080;     // DR=100, 1600SPS (reasonable default)
            config = config | 0x0003;     // disable comparator (COMP_QUE=11)

            this._writeRegister(ADS1015_REG_CONFIG, config);

            // Wait for the conversion to finish (could poll the OS bit instead).
            basic.pause(3);

            let raw = this._readRegister16(ADS1015_REG_CONVERSION);

            // The result occupies the top 12 of the 16 bits.
            raw = raw >> 4;

            // Signed 12-bit value: if bit 11 is set, it's negative.
            if (raw > 2047) {
                raw = raw - 4096;
            }

            return raw;
        }

        // Reads a channel and returns millivolts, per the configured gain.
        readMillivolts(channel: Ads1015Channel): number {
            const raw = this.readRaw(channel);

            let fsr = 2048;
            switch (this._gain) {
                case Ads1015Gain.Fsr6_144V: fsr = 6144; break;
                case Ads1015Gain.Fsr4_096V: fsr = 4096; break;
                case Ads1015Gain.Fsr2_048V: fsr = 2048; break;
                case Ads1015Gain.Fsr1_024V: fsr = 1024; break;
                case Ads1015Gain.Fsr0_512V: fsr = 512; break;
                case Ads1015Gain.Fsr0_256V: fsr = 256; break;
            }

            return (raw * fsr) / 2048;
        }
    }
}
