//% color="#84c324" icon="\uf057"
//% groups="['Sensores', 'Motores', 'Servos', 'Sensores Genericos', 'Simulador']"
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
    //% shim=ENUM_GET
    //% blockId=sensor_enum_shim
    //% blockHidden=true
    //% block="$arg"
    //% enumName="SensorName"
    //% enumMemberName="sensor"
    //% enumPromptHint="Ej: Humedad"
    //% enumInitialMembers="Humedad,presión,sonido"
    //% group="Sensores Genericos"
    export function _sensorEnumShim(arg: number) {
        return arg;
    }
    //% blockId="butia_imp_read_generic"
    //% block="Sensor de $sensorName en $connector"
    //% sensorName.shadow="sensor_enum_shim"
    //% weight=67
    //% group="Sensores Genericos"
    export function readGenericSensor(sensorName: number, connector: Butia.Connector): number {
        return Butia.RobotDriver.getCurrentRobot().readGenericSensor(connector, sensorName);
    }
    
    //% shim=ENUM_GET
    //% blockId=servo_enum_shim
    //% blockHidden=true
    //% block="$arg"
    //% enumName="ServoName"
    //% enumMemberName="servo"
    //% enumPromptHint="Ej: Garra"
    //% enumInitialMembers="Garra,Brazo,Cabeza"
    //% group="Servos"
    export function _servoEnumShim(arg: number): number {
        return arg;
    }

    //% blockId="butia_servo_set_angle"
    //% block="Servo $servoName en $connector fijar ángulo a $degrees °"
    //% servoName.shadow="servo_enum_shim"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=50
    //% group="Servos"
    export function servoSetAngle(servoName: number, connector: Butia.Connector, degrees: number): void {
        Butia.RobotDriver.getCurrentRobot().servoSetAngle(connector, servoName, degrees);
    }

    //% blockId="butia_servo_run"
    //% block="Servo continuo $servoName en $connector girar a velocidad $speed"
    //% servoName.shadow="servo_enum_shim"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% weight=48
    //% group="Servos"
    export function servoRun(servoName: number, connector: Butia.Connector, speed: number): void {
        Butia.RobotDriver.getCurrentRobot().servoRun(connector, servoName, speed);
    }

    //% blockId="butia_servo_stop"
    //% block="Servo $servoName en $connector detener"
    //% servoName.shadow="servo_enum_shim"
    //% weight=46
    //% group="Servos"
    export function servoStop(servoName: number, connector: Butia.Connector): void {
        Butia.RobotDriver.getCurrentRobot().servoStop(connector, servoName);
    }

    //% blockId="butia_servo_set_pulse"
    //% block="Servo $servoName en $connector fijar pulso a $micros µs"
    //% servoName.shadow="servo_enum_shim"
    //% micros.min=500 micros.max=2500 micros.defl=1500
    //% weight=44
    //% group="Servos"
    export function servoSetPulse(servoName: number, connector: Butia.Connector, micros: number): void {
        Butia.RobotDriver.getCurrentRobot().servoSetPulse(connector, servoName, micros);
    }


    //% blockId="butia_servo_stop_on_neutral"
    //% block="Servo $servoName en $connector detener en neutro $enabled"
    //% servoName.shadow="servo_enum_shim"
    //% enabled.defl=true
    //% weight=40
    //% group="Servos"
    export function servoSetStopOnNeutral(servoName: number, connector: Butia.Connector, enabled: boolean): void {
        Butia.RobotDriver.getCurrentRobot().servoSetStopOnNeutral(connector, servoName, enabled);
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
    //% block="usar mapa %map"
    //% weight=50
    //% group="Simulador"
    export function setMap(map: SimMap): void {
        _butiaSimSelectMap(map);
    }

}
