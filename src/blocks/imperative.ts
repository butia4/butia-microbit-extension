//% color="#3d6fc4" icon="" weight=90
//% groups="['Sensores', 'Motores']"
namespace ButiaImperative {

    export enum Jconectors {
        //% block="J1"
        J1 = 1,  // Ej: AnalogPin.P1
        //% block="J2"
        J2 = 2, // Ej: AnalogPin.P2
        //% block="J3"
        J3 = 3,
        //% block="J4"
        J4 = 4,
        //% block="J5"
        J5 = 5,
    }

    //% blockId="butia_imp_move_forward"
    //% block="Avanzar a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=100
    //% group="Motores"
    export function moveForward(speed: number, duration?: number): void {
        robot.moveForward(speed, duration)
    }

    //% blockId="butia_imp_move_backward"
    //% block="Retroceder a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=95
    //% group="Motores"
    export function moveBackward(speed: number, duration?: number): void {
        robot.moveBackward(speed, duration)
    }

    //% blockId="butia_imp_turn"
    //% block="Girar hacia %direction a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=90
    //% group="Motores"
    export function turn(direction: TurnDirection, speed: number, duration?: number): void {
        robot.turn(direction, speed, duration)
    }

    //% blockId="butia_imp_motor_tank"
    //% block="Motor Izquierdo %left Derecho %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motores"
    export function motorTank(left: number, right: number): void {
        robot.motorTank(left, right)
    }

    //% blockId="butia_imp_stop"
    //% block="Apagar Motor"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        robot.motorStop()
    }

    //% blockId="butia_imp_read_gray"
    //% block="Sensor de grises en %pin"
    //% weight=70
    //% group="Sensores"
    export function readGraySensor(pin: Jconectors): number {
        return robot.readGraySensor(pin)
    }

    //% blockId="butia_imp_read_light"
    //% block="Sensor de luz en %pin"
    //% weight=69
    //% group="Sensores"
    export function readLightSensor(pin: Jconectors): number {
        return robot.readLightSensor(pin)
    }

    //% blockId="butia_imp_read_button"
    //% block="Botón en %pin presionado"
    //% weight=68
    //% group="Sensores"
    export function readButton(pin: Jconectors): boolean {
        return robot.readButton(pin)
    }

    //% blockId="butia_imp_detect_line"
    //% block="Sensor de línea %id detecta línea"
    //% weight=70
    //% group="Sensores"
    export function detectLine(id: LineSensorId): boolean {
        return robot.detectLine(id)
    }

    //% blockId="butia_imp_distance"
    //% block="Distancia al obstáculo (cm)"
    //% weight=65
    //% group="Sensores"
    export function obstacleDistance(): number {
        return robot.obstacleDistance()
    }

    //% blockId="butia_imp_set_assist"
    //% block="Activar asistencia %assist %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=10
    //% group="Motores"
    export function setAssist(assist: RobotAssist, enabled: boolean): void {
        robot.setAssist(assist, enabled)
    }
}
