//% color="#3d6fc4" icon="" weight=90
namespace ButiaImperative {

    //% blockId="butia_imp_move_forward"
    //% block="move forward at speed %speed || for %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=100
    export function moveForward(speed: number, duration?: number): void {
        robot.moveForward(speed, duration)
    }

    //% blockId="butia_imp_move_backward"
    //% block="move backward at speed %speed || for %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=95
    export function moveBackward(speed: number, duration?: number): void {
        robot.moveBackward(speed, duration)
    }

    //% blockId="butia_imp_turn"
    //% block="turn %direction at speed %speed || for %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=90
    export function turn(direction: TurnDirection, speed: number, duration?: number): void {
        robot.turn(direction, speed, duration)
    }

    //% blockId="butia_imp_motor_tank"
    //% block="motor left %left right %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    export function motorTank(left: number, right: number): void {
        robot.motorTank(left, right)
    }

    //% blockId="butia_imp_stop"
    //% block="stop"
    //% weight=80
    export function motorStop(): void {
        robot.motorStop()
    }

    //% blockId="butia_imp_detect_line"
    //% block="line sensor %id detects line"
    //% weight=70
    export function detectLine(id: LineSensorId): boolean {
        return robot.detectLine(id)
    }

    //% blockId="butia_imp_distance"
    //% block="obstacle distance (cm)"
    //% weight=65
    export function obstacleDistance(): number {
        return robot.obstacleDistance()
    }

    //% blockId="butia_imp_set_assist"
    //% block="set assist %assist %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=10
    export function setAssist(assist: RobotAssist, enabled: boolean): void {
        robot.setAssist(assist, enabled)
    }
}
