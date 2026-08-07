namespace Butia {
    export class SimDistanceSensor implements IDistanceSensor {
        private _connName: string;
        private _pin: AnalogPin | DigitalPin;

        constructor(connName: string, pin: AnalogPin | DigitalPin) {
            this._connName = connName;
            this._pin = pin;
        }

        pin(): number { return this._pin as number; }
        init(): void {}
        connectorName(): string { return this._connName; }
        sensorType(): string { return "distance"; }

        read(): number {
            const v = simState.sensorCache[this._connName];
            return v !== undefined ? v : -1;
        }
    }

    export class SimGraySensor implements IGraySensor {
        private _connName: string;
        private _pin: AnalogPin | DigitalPin;

        constructor(connName: string, pin: AnalogPin | DigitalPin) {
            this._connName = connName;
            this._pin = pin;
        }

        pin(): number { return this._pin as number; }
        init(): void {}
        connectorName(): string { return this._connName; }
        sensorType(): string { return "gray"; }

        read(): number {
            const v = simState.sensorCache[this._connName];
            return v !== undefined ? v : -1;
        }
    }

    export class SimLightSensor implements ILightSensor {
        private _connName: string;
        private _pin: AnalogPin | DigitalPin;

        constructor(connName: string, pin: AnalogPin | DigitalPin) {
            this._connName = connName;
            this._pin = pin;
        }

        pin(): number { return this._pin as number; }
        init(): void {}
        connectorName(): string { return this._connName; }
        sensorType(): string { return "light"; }

        read(): number {
            const v = simState.sensorCache[this._connName];
            return v !== undefined ? v : -1;
        }
    }

    // read() returns 1 (pressed) or 0 (released) to satisfy IButtonSensor (read(): number).
    export class SimButtonSensor implements IButtonSensor {
        private _connName: string;
        private _pin: AnalogPin | DigitalPin;

        constructor(connName: string, pin: AnalogPin | DigitalPin) {
            this._connName = connName;
            this._pin = pin;
        }

        pin(): number { return this._pin as number; }
        init(): void {}
        connectorName(): string { return this._connName; }
        sensorType(): string { return "button"; }

        read(): number {
            return simState.sensorCache[this._connName] === 1 ? 1 : 0;
        }
    }
}
