//% color="#e67e22" icon="" weight=80
namespace ButiaEvents {

    //% blockId="butia_evt_line_left"
    //% block="on line left detected"
    //% weight=100
    export function onLineLeft(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineLeftDetected, handler)
    }

    //% blockId="butia_evt_line_right"
    //% block="on line right detected"
    //% weight=99
    export function onLineRight(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineRightDetected, handler)
    }

    //% blockId="butia_evt_line_both"
    //% block="on both lines detected"
    //% weight=98
    export function onLineBoth(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineBothDetected, handler)
    }

    //% blockId="butia_evt_line_none"
    //% block="on line lost"
    //% weight=97
    export function onLineNone(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.LineNoneDetected, handler)
    }

    //% blockId="butia_evt_obstacle_near"
    //% block="on obstacle near"
    //% weight=90
    export function onObstacleNear(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.ObstacleNear, handler)
    }

    //% blockId="butia_evt_obstacle_far"
    //% block="on obstacle far"
    //% weight=89
    export function onObstacleFar(handler: () => void): void {
        control.onEvent(BUTIA_EVENT_SOURCE, ButiaEvent.ObstacleFar, handler)
    }

    //% blockId="butia_evt_button_a"
    //% block="on button A pressed"
    //% weight=80
    export function onButtonAPressed(handler: () => void): void {
        input.onButtonPressed(Button.A, handler)
    }

    //% blockId="butia_evt_button_b"
    //% block="on button B pressed"
    //% weight=75
    export function onButtonBPressed(handler: () => void): void {
        input.onButtonPressed(Button.B, handler)
    }

    //% blockId="butia_evt_shake"
    //% block="on shake"
    //% weight=70
    export function onShake(handler: () => void): void {
        input.onGesture(Gesture.Shake, handler)
    }
}
