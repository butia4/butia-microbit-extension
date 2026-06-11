//% color="#84c324" icon="\uf057"
//% groups="['Sensores', 'Motores']"
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
    //% block="Apagar Motor"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        Butia.RobotDriver.getCurrentRobot().motorStop();
    }

    //% blockId="butia_imp_stop_single"
    //% block="Apagar Motor %motor"
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
    //% block="Sensor de Distancia en %connector"
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
    //% block="Cuando el sensor de distancia en %connector sea %op %threshold cm"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=65
    //% advanced=true
    export function onDistance(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onDistance(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_light"
    //% block="Cuando el sensor de luz en %connector sea %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=60
    //% advanced=true
    export function onLight(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onLight(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_gray"
    //% block="Cuando el sensor de grises en %connector sea %op %threshold"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% weight=55
    //% advanced=true
    export function onGray(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onGray(connector, op, threshold, handler);
    }

    //% blockId="butia_evt_button"
    //% block="Cuando se %state el botón en %connector"
    //% weight=70
    //% advanced=true
    export function onButton(
        state: ButtonState,
        connector: Butia.Connector,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().onConnectorButton(connector, state, handler);
    }
    //% blockId="butia_react_sensor_motor"
    //% block="Mientras sensor de $sensor en %connector sea %op %threshold $action $target || a velocidad %speed"
    //% speed.defl=50 speed.min=0 speed.max=100
    //% weight=100
    //% advanced=true
    export function whileSensorMotor(
        sensor: ReactiveSensorType,
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        action: ReactiveAction,
        target: MotorTarget,
        handler?: () => void,
        speed?: number,
    ): void {
        const spd = action === ReactiveAction.Stop ? 0 : (speed === undefined ? 50 : speed);
        Butia.RobotDriver.getCurrentRobot().resolveWhile(sensor,connector, op, threshold, action, target, spd);

        
    }


    /*//% blockId="butia_react_arc_around"
    //% block="Mientras sensor de distancia en %connector sea %op %threshold rodear hacia %side a velocidad %speed"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% speed.defl=50 speed.min=0 speed.max=100
    //% weight=90
    //% advanced=true
    export function whileArcAround(
        connector: Butia.Connector,
        op: Comparison,
        threshold: number,
        side: ArcSide,
        speed: number,
        handler?: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().whileArcAround(connector, op, threshold, side, speed);
    }*/

    /*//% blockId="butia_react_line_loss_clear"
    //% block="Mientras pierde línea en %grayConnector ≥ %grayThreshold y camino libre adelante en %distanceConnector ≥ %clearDistance detener %target"
    //% grayThreshold.defl=30 grayThreshold.min=1 grayThreshold.max=100
    //% clearDistance.defl=25 clearDistance.min=1 clearDistance.max=100
    //% weight=85
    //% advanced=true
    export function whileLineLossWithClearPath(
        grayConnector: Butia.Connector,
        grayThreshold: number,
        distanceConnector: Butia.Connector,
        clearDistance: number,
        target: MotorTarget,
        handler: () => void
    ): void {
        Butia.RobotDriver.getCurrentRobot().whileGrayLineLossWithClearPath(
            grayConnector,
            grayThreshold,
            distanceConnector,
            clearDistance,
            target
        );
    }

    //% blockId="butia_react_stop"
    //% block="al detener modo reactivo"
    //% weight=80
    //% advanced=true
    export function stopReactiveMode(): void {
        Butia.RobotDriver.getCurrentRobot().stopReactiveMode();
    }*/
}
