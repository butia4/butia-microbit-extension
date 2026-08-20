// Register-level driver for the ADS1015 I2C 12-bit ADC (default address
// 0x48, ADDR tied to GND). Used on the Mapper PCB to reach PIN_AD_0..
// PIN_AD_2 — see docs/pcb_microbit.pdf, sheet "Input Output" (U14).
// Gain is fixed at the +/-4.096V full-scale range (2 mV/LSB), matching the
// 3.3V sensor rail used on this board's connectors.

namespace butia {
    const ads1015RegConversion = 0x00;
    const ads1015RegConfig = 0x01;
    const ads1015MillivoltsPerLsb = 2;

    export class Ads1015Driver {
        private _address: number;

        // PXT only allows numeric/null/boolean literal defaults (TS9212),
        // so the named constant can't be used directly as the default here.
        constructor(address: number = 0x48) {
            this._address = address;
        }

        init(): void {}

        readMillivolts(channel: number): number {
            const cfg = 0x8000                 // OS: start single conversion
                | ((4 + channel) << 12)         // MUX: single-ended AINx
                | (1 << 9)                      // PGA: +/-4.096V
                | (1 << 8)                      // MODE: single-shot
                | (4 << 5)                      // DR: 1600 SPS
                | 0x0003;                       // COMP_QUE: disable comparator

            const cfgBuf = pins.createBuffer(3);
            cfgBuf.setNumber(NumberFormat.UInt8LE, 0, ads1015RegConfig);
            cfgBuf.setNumber(NumberFormat.UInt8LE, 1, (cfg >> 8) & 0xFF);
            cfgBuf.setNumber(NumberFormat.UInt8LE, 2, cfg & 0xFF);
            pins.i2cWriteBuffer(this._address, cfgBuf);

            // 1600 SPS conversion is ~0.6ms; pad for margin.
            basic.pause(2);

            const ptr = pins.createBuffer(1);
            ptr.setNumber(NumberFormat.UInt8LE, 0, ads1015RegConversion);
            pins.i2cWriteBuffer(this._address, ptr, true);
            const result = pins.i2cReadBuffer(this._address, 2);
            const raw = result.getNumber(NumberFormat.Int16BE, 0);
            return (raw >> 4) * ads1015MillivoltsPerLsb;
        }
    }
}
