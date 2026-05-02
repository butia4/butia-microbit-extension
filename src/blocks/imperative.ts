//% color="#3d6fc4" icon="" weight=90
//% groups="['Sensores', 'Motores']"
namespace Butia {

    //% block="Inicializar %robot"
    //% blockId=butia_robot_start
    //% weight=100
    //% group="Obligatorio"
    export function start(robot: Butia.RobotDriver): void {
        Butia.RobotDriver.start(robot)
    }

    //% blockId="butia_imp_move_forward"
    //% block="Avanzar a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=100
    //% group="Motores"
    export function moveForward(speed: number, duration?: number): void {
        Butia.RobotDriver.getCurrentRobot().moveForward(speed, duration)
    }

    //% blockId="butia_imp_move_backward"
    //% block="Retroceder a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=95
    //% group="Motores"
    export function moveBackward(speed: number, duration?: number): void {
        Butia.RobotDriver.getCurrentRobot().moveBackward(speed, duration)
    }

    //% blockId="butia_imp_turn"
    //% block="Girar hacia %direction a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=90
    //% group="Motores"
    export function turn(direction: TurnDirection, speed: number, duration?: number): void {
        Butia.RobotDriver.getCurrentRobot().turn(direction, speed, duration)
    }

    //% blockId="butia_imp_motor_tank"
    //% block="Motor Izquierdo %left Derecho %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motores"
    export function motorTank(left: number, right: number): void {
        Butia.RobotDriver.getCurrentRobot().motorTank(left, right)
    }

    //% blockId="butia_imp_stop"
    //% block="Apagar Motor"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        Butia.RobotDriver.getCurrentRobot().motorStop()
    }

    //% blockId="butia_imp_read_gray"
    //% block="Sensor de grises en %pin"
    //% weight=70
    //% group="Sensores"
    export function readGraySensor(pin: string): number {
        return Butia.RobotDriver.getCurrentRobot().readGraySensor(pin)
    }

    //% blockId="butia_imp_read_light"
    //% block="Sensor de luz en %pin"
    //% weight=69
    //% group="Sensores"
    export function readLightSensor(pin: string): number {
        return Butia.RobotDriver.getCurrentRobot().readLightSensor(pin)
    }

    //% blockId="butia_imp_read_button"
    //% block="Botón en %pin presionado"
    //% weight=68
    //% group="Sensores"
    export function readButton(pin: string): boolean {
        return Butia.RobotDriver.getCurrentRobot().readButton(pin)
    }

    //% blockId="butia_imp_distance"
    //% block="Sensor de Distancia en %pin"
    //% weight=69
    //% group="Sensores"
    export function obstacleDistance(pin: string): number {
        return Butia.RobotDriver.getCurrentRobot().readDistanceSensor(pin)
    }

    //% blockId="butia_imp_set_assist"
    //% block="Activar asistencia %assist %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=10
    //% group="Motores"
    export function setAssist(assist: RobotAssist, enabled: boolean): void {
        Butia.RobotDriver.getCurrentRobot().setAssist(assist, enabled)
    }
}
