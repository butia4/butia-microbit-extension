//% color="#84c324" icon="\uf057"
//% groups="['Sensores', 'Motores', 'Simulador']"
namespace Butia {

    //% blockId="butia_imp_move_forward"
    //% block="Avanzar a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=100
    //% group="Motores"
    export function moveForward(speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : 0;
        Butia.RobotDriver.getCurrentRobot().moveForward(speed, ms);
    }

    //% blockId="butia_imp_move_backward"
    //% block="Retroceder a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=95
    //% group="Motores"
    export function moveBackward(speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : 0;
        Butia.RobotDriver.getCurrentRobot().moveBackward(speed, ms);
    }

    //% blockId="butia_imp_turn"
    //% block="Girar hacia %direction a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.min=0
    //% duration.defl=0
    //% weight=90
    //% group="Motores"
    export function turn(direction: TurnDirection, speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : undefined;
        Butia.RobotDriver.getCurrentRobot().turn(direction, speed, ms);
    }

    //% blockId="butia_imp_motor_tank"
    //% block="Motor Izquierdo %left Derecho %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motores"
    export function motorTank(left: number, right: number): void {
        Butia.RobotDriver.getCurrentRobot().motorTank(left, right);
    }

    //% blockId="butia_imp_stop"
    //% block="Detener Motores"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        Butia.RobotDriver.getCurrentRobot().motorStop();
    }

    //% blockId="butia_imp_stop_single"
    //% block="Detener Motor %motor"
    //% weight=79
    //% group="Motores"
    export function motorStopSingle(motor: MotorSide): void {
        if (motor === MotorSide.Left) {
            Butia.RobotDriver.getCurrentRobot().motorTank(0, Butia.RobotDriver.getCurrentRobot().motorRight());
        } else {
            Butia.RobotDriver.getCurrentRobot().motorTank(Butia.RobotDriver.getCurrentRobot().motorLeft(), 0);
        }
    }

    //% blockId="butia_imp_read_gray"
    //% block="Sensor de grises en %connector"
    //% weight=70
    //% group="Sensores"
    export function readGraySensor(connector: Butia.Connector): number {
        return Butia.RobotDriver.getCurrentRobot().readGraySensor(connector);
    }

    //% blockId="butia_imp_read_light"
    //% block="Sensor de luz en %connector"
    //% weight=69
    //% group="Sensores"
    export function readLightSensor(connector: Butia.Connector): number {
        return Butia.RobotDriver.getCurrentRobot().readLightSensor(connector);
    }

    //% blockId="butia_imp_distance"
    //% block="Sensor de distancia en %connector"
    //% weight=69
    //% group="Sensores"
    export function obstacleDistance(connector: Butia.Connector): number {
        return Butia.RobotDriver.getCurrentRobot().readDistanceSensor(connector);
    }

    //% blockId="butia_imp_read_button"
    //% block="Botón en %connector presionado"
    //% weight=68
    //% group="Sensores"
    export function readButton(connector: Butia.Connector): boolean {
        return Butia.RobotDriver.getCurrentRobot().readButton(connector);
    }
    //% blockId="butia_evt_distance"
    //% block="Cuando el sensor de distancia en %connector sea %op %threshold cm con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=65
    //% advanced=true
    export function onDistance(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onDistance(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_light"
    //% block="Cuando el sensor de luz en %connector sea %op %threshold con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=60
    //% advanced=true
    export function onLight(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onLight(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_gray"
    //% block="Cuando el sensor de grises en %connector sea %op %threshold con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=55
    //% advanced=true
    export function onGray(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onGray(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_button"
    //% block="Cuando se %state el botón en %connector con prioridad %priority"
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=70
    //% advanced=true
    export function onButton(
        state: ButtonState,
        connector: Butia.Connector,
        priority: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onConnectorButton(connector, state, priority, handler);
    }

    //% blockId="butia_sim_set_map"
    //% block="usar mapa %map con sensor izquierdo en %sensorIzquierdo y sensor derecho en %sensorDerecho"
    //% weight=50
    //% group="Simulador"
    export function setMap(map: SimMap, sensorIzquierdo: Butia.Connector, sensorDerecho: Butia.Connector): void {
        _butiaSimSelectMap(map, sensorIzquierdo.name, sensorDerecho.name);
    }

}
