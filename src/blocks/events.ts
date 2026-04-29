//% color="#e67e22" icon="" weight=80
//% groups="['Sensores', 'Eventos']"
namespace ButiaEvents {

    export enum Sensors {
        //% block="Luz"
        Light = 1,
        //% block="Grises"
        Gray = 2,
        //% block="Boton"
        Button = 3,
    }

    //% blockId="butia_evt_start_monitoring"
    //% block="Iniciar monitoreo de sensor %sensor en puerto %pin con umbral %threshold"
    //% threshold.min=1 threshold.max=1023
    //% weight=60
    //% group="Sensores"
    export function startMonitoring(sensor: Sensors, pin: ButiaImperative.Jconectors, threshold: number): void {
        robot.startMonitoring(sensor, pin, threshold)
    }

    //% blockId="butia_evt_on_level_reached"
    //% block="Cuando sensor %sensor en puerto %pin supera umbral"
    //% weight=55
    //% group="Eventos"
    export function onLevelReached(sensor: Sensors, pin: ButiaImperative.Jconectors, handler: () => void): void {
        robot.onLevelReached(sensor, pin, handler)
    }

    //% blockId="butia_evt_on_level_unreached"
    //% block="Cuando sensor %sensor en puerto %pin baja del umbral"
    //% weight=54
    //% group="Eventos"
    export function onLevelUnreached(sensor: Sensors, pin: ButiaImperative.Jconectors, handler: () => void): void {
        robot.onLevelUnreached(sensor, pin, handler)
    }

    //% blockId="butia_evt_start_monitoring_button"
    //% block="Monitorear botón en puerto %pin"
    //% weight=50
    //% group="Sensores"
    export function startMonitoringButton(pin: ButiaImperative.Jconectors): void {
        robot.startMonitoringButton(pin)
    }

    //% blockId="butia_evt_on_button"
    //% block="Cuando botón en puerto %pin es presionado"
    //% weight=45
    //% group="Eventos"
    export function onButton(pin: ButiaImperative.Jconectors, handler: () => void): void {
        robot.onButton(pin, handler)
    }

    //% blockId="butia_evt_line_left"
    //% block="Al detectar línea izquierda"
    //% weight=100
    //% group="Eventos"
    export function onLineLeft(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineLeftDetected, handler)
    }

    //% blockId="butia_evt_line_right"
    //% block="Al detectar línea derecha"
    //% weight=99
    //% group="Eventos"
    export function onLineRight(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineRightDetected, handler)
    }

    //% blockId="butia_evt_line_both"
    //% block="Al detectar ambas líneas"
    //% weight=98
    //% group="Eventos"
    export function onLineBoth(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineBothDetected, handler)
    }

    //% blockId="butia_evt_line_none"
    //% block="Al perder la línea"
    //% weight=97
    //% group="Eventos"
    export function onLineNone(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineNoneDetected, handler)
    }

    //% blockId="butia_evt_obstacle_near"
    //% block="Al detectar obstáculo cerca"
    //% weight=90
    //% group="Eventos"
    export function onObstacleNear(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.ObstacleNear, handler)
    }

    //% blockId="butia_evt_obstacle_far"
    //% block="Al no detectar obstáculo"
    //% weight=89
    //% group="Eventos"
    export function onObstacleFar(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.ObstacleFar, handler)
    }

    //% blockId="butia_evt_button_a"
    //% block="Al presionar botón A"
    //% weight=80
    //% group="Eventos"
    export function onButtonAPressed(handler: () => void): void {
        input.onButtonPressed(Button.A, handler)
    }

    //% blockId="butia_evt_button_b"
    //% block="Al presionar botón B"
    //% weight=75
    //% group="Eventos"
    export function onButtonBPressed(handler: () => void): void {
        input.onButtonPressed(Button.B, handler)
    }

    //% blockId="butia_evt_shake"
    //% block="Al agitar el micro:bit"
    //% weight=70
    //% group="Eventos"
    export function onShake(handler: () => void): void {
        input.onGesture(Gesture.Shake, handler)
    }
}
