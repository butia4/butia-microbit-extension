// I2C GPIO expander (4 extra digital pins, P0-P3) used to add I/O beyond the
// micro:bit's own pins. Butia v4 connectors that aren't wired to a direct
// GPIO pin resolve through here instead.

namespace butia {
    const PCA9536_REG_INPUT = 0x00;
    const PCA9536_REG_OUTPUT = 0x01;
    const PCA9536_REG_CONFIG = 0x03;

    export class Pca9536IoExpander {
        constructor(private _address: number = 0x41) {}

        private _writeRegister(reg: number, value: number): void {
            const buf = pins.createBuffer(2);
            buf.setNumber(NumberFormat.UInt8LE, 0, reg);
            buf.setNumber(NumberFormat.UInt8LE, 1, value);
            pins.i2cWriteBuffer(this._address, buf, false);
        }

        private _readRegister(reg: number): number {
            const regBuf = pins.createBuffer(1);
            regBuf.setNumber(NumberFormat.UInt8LE, 0, reg);
            pins.i2cWriteBuffer(this._address, regBuf, true);
            return pins.i2cReadBuffer(this._address, 1, false).getNumber(NumberFormat.UInt8LE, 0);
        }

        // Configures all 4 pins as outputs and turns them off.
        init(): void {
            this._writeRegister(PCA9536_REG_CONFIG, 0x00);
            this._writeRegister(PCA9536_REG_OUTPUT, 0x00);
        }

        // pin: 0 to 3. state: true = HIGH, false = LOW.
        writePin(pin: number, state: boolean): void {
            const current = this._readRegister(PCA9536_REG_OUTPUT);
            const mask = 1 << pin;
            const newValue = state ? (current | mask) : (current & (~mask & 0xFF));
            this._writeRegister(PCA9536_REG_OUTPUT, newValue);
        }

        readOutputStatus(): number {
            return this._readRegister(PCA9536_REG_OUTPUT);
        }

        // pin: 0 to 3. Returns true if HIGH.
        readPin(pin: number): boolean {
            const current = this._readRegister(PCA9536_REG_INPUT);
            const mask = 1 << pin;
            return (current & mask) !== 0;
        }
    }
}
