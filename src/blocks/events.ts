//% color="#e67e22" icon="" weight=80
//% groups="['Eventos']"
namespace ButiaEvents {

    //% blockId="butia_evt_distance"
    //% block="Cuando la distancia en %connector sea %op %threshold cm"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=65
    //% group="Eventos"
    export function onDistance(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onDistance(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_light"
    //% block="Cuando la luz en %connector sea %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=60
    //% group="Eventos"
    export function onLight(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onLight(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_gray"
    //% block="Cuando el sensor de grises en %connector sean %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=55
    //% group="Eventos"
    export function onGray(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onGray(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_button"
    //% block="Cuando se %state el botón en %connector"
    //% weight=70
    //% group="Eventos"
    export function onButton(
        state: ButtonState,
        connector: Butia.Connector,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onConnectorButton(connector, state, handler);
    }
}