namespace Butia {
    //% fixedInstances
    export class ButiaV4Connector extends Connector {
        constructor(name: string) { super(name); }
    }

    //% fixedInstance whenUsed block="J1"
    export const J1 = new ButiaV4Connector("J1");
    //% fixedInstance whenUsed block="J2"
    export const J2 = new ButiaV4Connector("J2");
    //% fixedInstance whenUsed block="J3"
    export const J3 = new ButiaV4Connector("J3");
    //% fixedInstance whenUsed block="J4"
    export const J4 = new ButiaV4Connector("J4");
    //% fixedInstance whenUsed block="J5"
    export const J5 = new ButiaV4Connector("J5");
}
