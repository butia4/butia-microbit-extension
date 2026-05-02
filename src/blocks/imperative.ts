//% color="#3d6fc4" icon="" weight=90
//% groups="['Configuración', 'Sensores', 'Motores']"
namespace Butia {

    //% blockId="butia_cfg_motor_left"
    //% block="Configurar motor izquierdo en conectores %c1 y %c2"
    //% weight=99
    //% group="Configuración"
    export function configureMotorLeft(c1: Connector, c2: Connector): void {
        RobotSystem.configureMotorLeft(c1, c2);
    }

    //% blockId="butia_cfg_motor_right"
    //% block="Configurar motor derecho en conectores %c1 y %c2"
    //% weight=98
    //% group="Configuración"
    export function configureMotorRight(c1: Connector, c2: Connector): void {
        RobotSystem.configureMotorRight(c1, c2);
    }

    //% block="Inicializar %model"
    //% blockId=butia_robot_start
    //% weight=100
    //% group="Obligatorio"
    export function start(model: RobotModel): void {
        RobotSystem.setActive(model);
    }

    //% blockId="butia_imp_move_forward"
    //% block="Avanzar a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=100
    //% group="Motores"
    export function moveForward(speed: number, duration?: number): void {
        RobotSystem.activeRobot().moveForward(speed, duration);
    }

    //% blockId="butia_imp_move_backward"
    //% block="Retroceder a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=95
    //% group="Motores"
    export function moveBackward(speed: number, duration?: number): void {
        RobotSystem.activeRobot().moveBackward(speed, duration);
    }

    //% blockId="butia_imp_turn"
    //% block="Girar hacia %direction a velocidad %speed || durante %duration ms"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.shadow=timePicker expandableArgumentMode="toggle"
    //% weight=90
    //% group="Motores"
    export function turn(direction: TurnDirection, speed: number, duration?: number): void {
        RobotSystem.activeRobot().turn(direction, speed, duration);
    }

    //% blockId="butia_imp_motor_tank"
    //% block="Motor Izquierdo %left Derecho %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motores"
    export function motorTank(left: number, right: number): void {
        RobotSystem.activeRobot().motorTank(left, right);
    }

    //% blockId="butia_imp_stop"
    //% block="Apagar Motor"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        RobotSystem.activeRobot().motorStop();
    }

    //% blockId="butia_imp_read_gray"
    //% block="Sensor de grises en %connector"
    //% weight=70
    //% group="Sensores"
    export function readGraySensor(connector: Connector): number {
        return RobotSystem.activeRobot().readGraySensor(connector);
    }

    //% blockId="butia_imp_read_light"
    //% block="Sensor de luz en %connector"
    //% weight=69
    //% group="Sensores"
    export function readLightSensor(connector: Connector): number {
        return RobotSystem.activeRobot().readLightSensor(connector);
    }

    //% blockId="butia_imp_read_button"
    //% block="Botón en %connector presionado"
    //% weight=68
    //% group="Sensores"
    export function readButton(connector: Connector): boolean {
        return RobotSystem.activeRobot().readButton(connector);
    }

    //% blockId="butia_imp_distance"
    //% block="Sensor de Distancia en %connector"
    //% weight=69
    //% group="Sensores"
    export function obstacleDistance(connector: Connector): number {
        return RobotSystem.activeRobot().readDistanceSensor(connector);
    }

    //% blockId="butia_imp_set_assist"
    //% block="Activar asistencia %assist %enabled"
    //% enabled.shadow=toggleOnOff
    //% weight=10
    //% group="Motores"
    export function setAssist(assist: RobotAssist, enabled: boolean): void {
        RobotSystem.activeRobot().setAssist(assist, enabled);
    }
}
