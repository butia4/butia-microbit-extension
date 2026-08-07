// Buffer augments a pxt-core type, so it must stay in the global namespace.
declare namespace Buffer {
    function fromUTF8(str: string): Buffer
}

interface Buffer {
    toString(): string;
}

declare namespace Butia {
    export interface IRobotComponent {
        init(): void
    }

    export interface ISensor extends IRobotComponent {
        read(): number
    }

    export interface IPolledSensor extends ISensor {
        pin(): number
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IDistanceSensor extends IPolledSensor {}

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface ILightSensor extends IPolledSensor {}

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IGraySensor extends IPolledSensor {}

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IButtonSensor extends IPolledSensor { }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IGenericSensor extends IPolledSensor {}

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface IActuator extends IRobotComponent {}

    export interface IMotorDriver extends IActuator {
        setSpeed(left: number, right: number): void
        stop(): void
    }

    export interface IServoDriver extends IActuator {
        setAngle(degrees: number): void
    }
}
