//% color="#e67e22" icon="" weight=80
//% groups="['Eventos']"
namespace ButiaEvents {

    //% blockId="butia_evt_distance"
    //% block="Sensor de distancia en %connector  %op  %threshold cm"
    //% threshold.defl=20 threshold.min=1 threshold.max=400
    //% weight=65
    //% group="Eventos"
    export function onDistance(connector: Butia.Connector, op: Comparison, threshold: number, handler: () => void): void {
        Butia.RobotDriver.getCurrentRobot().onDistance(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_light"
    //% block="Sensor de luz en %connector %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=60
    //% group="Eventos"
    export function onLight(connector: Butia.Connector, op: Comparison, threshold: number, handler: () => void): void {
        Butia.RobotDriver.getCurrentRobot().onLight(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_gray"
    //% block="Sensor de grises en %connector %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=60
    //% group="Eventos"
    export function onGray(connector: Butia.Connector, op: Comparison, threshold: number, handler: () => void): void {
        Butia.RobotDriver.getCurrentRobot().onGray(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_button"
    //% block="Sensor de Botón en %connector al %state"
    //% weight=70
    //% group="Eventos"
    export function onButton(connector: Butia.Connector, state: ButtonState, handler: () => void): void {
        Butia.RobotDriver.getCurrentRobot().onConnectorButton(connector, state, handler);
    }

}
