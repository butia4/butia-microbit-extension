class SimDistanceSensor implements IDistanceSensor {
    private _connName: string;
    private _pin: AnalogPin | DigitalPin;

    constructor(connName: string, pin: AnalogPin | DigitalPin) {
        this._connName = connName;
        this._pin = pin;
    }

    getPin(): number { return this._pin as number; }
    init(): void {}
    getConnName(): string { return this._connName; }
    getSensorType(): string { return "distance"; }

    read(): number {
        const v = SimState.sensorCache[this._connName];
        return v !== undefined ? v : -1;
    }
}

class SimGraySensor implements IGraySensor {
    private _connName: string;
    private _pin: AnalogPin | DigitalPin;

    constructor(connName: string, pin: AnalogPin | DigitalPin) {
        this._connName = connName;
        this._pin = pin;
    }

    getPin(): number { return this._pin as number; }
    init(): void {}
    getConnName(): string { return this._connName; }
    getSensorType(): string { return "gray"; }

    read(): number {
        const v = SimState.sensorCache[this._connName];
        return v !== undefined ? v : -1;
    }
}

class SimLightSensor implements ILightSensor {
    private _connName: string;
    private _pin: AnalogPin | DigitalPin;

    constructor(connName: string, pin: AnalogPin | DigitalPin) {
        this._connName = connName;
        this._pin = pin;
    }

    getPin(): number { return this._pin as number; }
    init(): void {}
    getConnName(): string { return this._connName; }
    getSensorType(): string { return "light"; }

    read(): number {
        const v = SimState.sensorCache[this._connName];
        return v !== undefined ? v : -1;
    }
}

// read() returns 1 (pressed) or 0 (released) to satisfy IButtonSensor (read(): number).
class SimButtonSensor implements IButtonSensor {
    private _connName: string;
    private _pin: AnalogPin | DigitalPin;

    constructor(connName: string, pin: AnalogPin | DigitalPin) {
        this._connName = connName;
        this._pin = pin;
    }

    getPin(): number { return this._pin as number; }
    init(): void {}
    getConnName(): string { return this._connName; }
    getSensorType(): string { return "button"; }

    read(): number {
        return SimState.sensorCache[this._connName] === 1 ? 1 : 0;
    }
}
