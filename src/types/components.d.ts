// Buffer augments a pxt-core type, so it must stay in the global namespace.
declare namespace Buffer {
    function fromUTF8(str: string): Buffer
}

interface Buffer {
    toString(): string;
}

declare namespace butia { 

    export interface ISensor {
        read(): number
    }

    export interface IButtonSensor {
        isPressed(): boolean
    }

    export interface IMotorDriver {
        setSpeed(left: number, right: number): void
        stop(): void
    }

    export interface IServoDriver {
        setAngle(degrees: number): void
    }
    export type IDistanceSensor = ISensor;
    export type ILightSensor = ISensor;
    export type IGraySensor = ISensor;
    export type IGenericSensor = ISensor;
}
