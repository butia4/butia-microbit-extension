// Register-level driver for the PCA9536 4-bit I2C GPIO expander (fixed
// address 0x41). Used on the Mapper PCB to reach PD0_ext..PD3_ext, which are
// not wired to microbit GPIO directly — see docs/pcb_microbit.pdf, sheet
// "Input Output" (U15).

namespace butia {
    const pca9536RegInputPort = 0x00;
    const pca9536RegOutputPort = 0x01;
    const pca9536RegConfig = 0x03; // bit=1 -> input (power-on default), bit=0 -> output

    export class Pca9536Driver {
        private _address: number;
        private _outputState: number;
        private _configState: number;

        // PXT only allows numeric/null/boolean literal defaults (TS9212),
        // so the named constant can't be used directly as the default here.
        constructor(address: number = 0x41) {
            this._address = address;
            this._outputState = 0x00;
            this._configState = 0xFF;
        }

        // Writes CONFIG/OUTPUT to the chip explicitly instead of just
        // resetting local state — protects against a warm re-flash carrying
        // over a previous run's pin directions on this same power cycle.
        init(): void {
            this._outputState = 0x00;
            this._configState = 0xFF;
            this._writeReg(pca9536RegConfig, this._configState);
            this._writeReg(pca9536RegOutputPort, this._outputState);
        }

        writePin(pin: number, value: boolean): void {
            const mask = 1 << pin;
            this._configState = this._configState & ~mask & 0xFF;
            this._writeReg(pca9536RegConfig, this._configState);
            this._outputState = value
                ? (this._outputState | mask) & 0xFF
                : this._outputState & ~mask & 0xFF;
            this._writeReg(pca9536RegOutputPort, this._outputState);
        }

        readPin(pin: number): boolean {
            const mask = 1 << pin;
            this._configState = (this._configState | mask) & 0xFF;
            this._writeReg(pca9536RegConfig, this._configState);
            const input = this._readReg(pca9536RegInputPort);
            return (input & mask) !== 0;
        }

        private _writeReg(reg: number, value: number): void {
            const buf = pins.createBuffer(2);
            buf.setNumber(NumberFormat.UInt8LE, 0, reg);
            buf.setNumber(NumberFormat.UInt8LE, 1, value);
            pins.i2cWriteBuffer(this._address, buf);
        }

        private _readReg(reg: number): number {
            const ptr = pins.createBuffer(1);
            ptr.setNumber(NumberFormat.UInt8LE, 0, reg);
            pins.i2cWriteBuffer(this._address, ptr, true);
            const result = pins.i2cReadBuffer(this._address, 1);
            return result.getNumber(NumberFormat.UInt8LE, 0);
        }
    }
}
