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

}
