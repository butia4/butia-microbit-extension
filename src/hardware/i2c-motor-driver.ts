class I2CMotorDriver implements IMotorDriver {
    private _address: number

    constructor(address: number) {
        this._address = address
    }

    init(): void {
        // TODO: I2C initialization sequence (pending Butia v4 schematic)
    }

    setSpeed(_left: number, _right: number): void {
        // TODO: I2C write protocol for motor controller (pending schematic)
        // left/right in [-100, 100]; negative = reverse
    }

    stop(): void {
        this.setSpeed(0, 0)
    }
}
