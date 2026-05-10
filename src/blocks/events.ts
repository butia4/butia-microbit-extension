//% color="#e67e22" icon="" weight=80
//% groups="['Eventos']"
namespace ButiaEvents {

    //% blockId="butia_evt_button_a"
    //% block="Al presionar botón A"
    //% weight=80
    //% group="Eventos"
    export function onButtonAPressed(handler: () => void): void {
        input.onButtonPressed(Button.A, handler);
    }

    //% blockId="butia_evt_button_b"
    //% block="Al presionar botón B"
    //% weight=75
    //% group="Eventos"
    export function onButtonBPressed(handler: () => void): void {
        input.onButtonPressed(Button.B, handler);
    }

    //% blockId="butia_evt_shake"
    //% block="Al agitar el micro:bit"
    //% weight=70
    //% group="Eventos"
    export function onShake(handler: () => void): void {
        input.onGesture(Gesture.Shake, handler);
    }

    //% blockId="butia_evt_distance_less_than"
    //% block="Al detectar obstáculo a menos de %threshold cm en %connector"
    //% threshold.defl=20 threshold.min=1 threshold.max=400
    //% weight=65
    //% group="Eventos"
    export function onDistanceLessThan(connector: Butia.Connector, threshold: number, handler: () => void): void {
        Butia.RobotDriver.getCurrentRobot().onDistanceLessThan(connector, threshold, handler);
    }
}
