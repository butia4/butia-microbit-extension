//% color="#84c324" icon="" block="Butia v4"
//% groups="['Motores', 'Sensores', 'Eventos', 'Sensores Genéricos', 'Servos']"
namespace butiaV4 {

    /**
     * Selecciona qué mapa de botsim usar. El robot se inicia automáticamente
     * la primera vez que se ejecuta cualquier otro bloque de Butia v4 —
     * no hace falta un bloque "start" separado.
     */
    //% blockId="butia_v4_select_map"
    //% blockHidden=true
    //% block="Butia v4 usar mapa %map"
    //% weight=111
    export function selectMap(map: ButiaSimMap): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia._simSelectMap(map);
    }

    /**
     * Hace avanzar ambos motores. Se ejecuta indefinidamente, o durante la duración indicada si se especifica.
     */
    //% blockId="butia_v4_imp_move_forward"
    //% blockHidden=true
    //% block="avanzar a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=100
    //% group="Motores"
    export function moveForward(speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV4);
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveForward(speed, ms);
    }

    /**
     * Hace retroceder ambos motores. Se ejecuta indefinidamente, o durante la duración indicada si se especifica.
     */
    //% blockId="butia_v4_imp_move_backward"
    //% blockHidden=true
    //% block="retroceder a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=95
    //% group="Motores"
    export function moveBackward(speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV4);
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveBackward(speed, ms);
    }

    /**
     * Gira en el lugar hacia la dirección indicada.
     */
    //% blockId="butia_v4_imp_turn"
    //% blockHidden=true
    //% block="girar hacia %direction a velocidad %speed || durante %duration segundos"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.min=0
    //% duration.defl=0
    //% weight=90
    //% group="Motores"
    export function turn(direction: ButiaTurnDirection, speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV4);
        const ms = duration ? duration * 1000 : undefined;
        butia.RobotDriver.currentRobot().turn(direction, speed, ms);
    }

    /**
     * Fija la velocidad de cada motor de forma independiente (tracción diferencial).
     */
    //% blockId="butia_v4_imp_motor_tank"
    //% blockHidden=true
    //% block="motor izquierdo %left derecho %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motores"
    export function motorTank(left: number, right: number): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().motorTank(left, right);
    }

    /**
     * Detiene ambos motores.
     */
    //% blockId="butia_v4_imp_stop"
    //% blockHidden=true
    //% block="detener motores"
    //% weight=80
    //% group="Motores"
    export function motorStop(): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().motorStop();
    }

    /**
     * Detiene un solo motor, dejando el otro en funcionamiento.
     */
    //% blockId="butia_v4_imp_stop_single"
    //% blockHidden=true
    //% block="detener motor %motor"
    //% weight=79
    //% group="Motores"
    export function motorStopSingle(motor: ButiaMotorSide): void {
        butia.RobotDriver.start(butia.butiaV4);
        if (motor === ButiaMotorSide.Left) {
            butia.RobotDriver.currentRobot().motorTank(0, butia.RobotDriver.currentRobot().motorRight());
        } else {
            butia.RobotDriver.currentRobot().motorTank(butia.RobotDriver.currentRobot().motorLeft(), 0);
        }
    }

    /**
     * Lee el sensor analógico de grises/línea en el conector indicado (0-100, mayor = más oscuro).
     */
    //% blockId="butia_v4_imp_read_gray"
    //% blockHidden=true
    //% block="sensor de grises en %connector"
    //% weight=70
    //% group="Sensores"
    export function readGraySensor(connector: butia.v4.ButiaV4Connector): number {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().readGraySensor(connector);
    }

    /**
     * Indica si el sensor de grises en el conector indicado ve actualmente el color indicado (usa una calibración por conector en el hardware y otra fija en el simulador; sin datos no es ni negro ni blanco).
     */
    //% blockId="butia_v4_imp_gray_sees"
    //% blockHidden=true
    //% block="sensor de grises en %connector ve %color"
    //% weight=72
    //% group="Sensores"
    export function graySensorSees(connector: butia.v4.ButiaV4Connector, color: ButiaColor): boolean {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().graySensorSees(connector, color);
    }

    /**
     * Ejecuta el manejador cuando el sensor de grises en el conector indicado ve el color indicado, con la prioridad indicada.
     */
    //% blockId="butia_v4_evt_gray_sees"
    //% blockHidden=true
    //% block="cuando el sensor de grises en %connector vea %color con prioridad %priority"
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=75
    //% group="Eventos"
    export function onGraySensorSees(
        connector: butia.v4.ButiaV4Connector,
        color: ButiaColor,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().onGraySensorSees(connector, color, priority, handler);
    }

    /**
     * Lee el sensor de luz en el conector indicado (0-100).
     */
    //% blockId="butia_v4_imp_read_light"
    //% blockHidden=true
    //% block="sensor de luz en %connector"
    //% weight=69
    //% group="Sensores"
    export function readLightSensor(connector: butia.v4.ButiaV4Connector): number {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().readLightSensor(connector);
    }

    /**
     * Lee el sensor de distancia en el conector indicado, en cm.
     */
    //% blockId="butia_v4_imp_distance"
    //% blockHidden=true
    //% block="sensor de distancia en %connector"
    //% weight=69
    //% group="Sensores"
    export function obstacleDistance(connector: butia.v4.ButiaV4Connector): number {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().readDistanceSensor(connector);
    }

    /**
     * Indica si el botón en el conector indicado está actualmente presionado.
     */
    //% blockId="butia_v4_imp_read_button"
    //% blockHidden=true
    //% block="botón en %connector presionado"
    //% weight=68
    //% group="Sensores"
    export function readButton(connector: butia.v4.ButiaV4Connector): boolean {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().readButton(connector);
    }

    //% shim=ENUM_GET
    //% blockId=sensor_enum_shim_v4
    //% blockHidden=true
    //% block="$arg"
    //% enumName="SensorNameV4"
    //% enumMemberName="sensor"
    //% enumPromptHint="eg: Humidity"
    //% enumInitialMembers="Humidity,Pressure,Sound"
    //% group="Sensores Genéricos"
    export function _sensorEnumShim(arg: number): number {
        return arg;
    }

    /**
     * Lee un sensor analógico genérico. Elegí un nombre existente o creá uno desde la lista desplegable.
     */
    //% blockId="butia_v4_imp_read_generic"
    //% blockHidden=true
    //% block="sensor de $sensorName en $connector"
    //% sensorName.shadow="sensor_enum_shim_v4"
    //% weight=67
    //% group="Sensores Genéricos"
    export function readGenericSensor(sensorName: number, connector: butia.v4.ButiaV4Connector): number {
        butia.RobotDriver.start(butia.butiaV4);
        return butia.RobotDriver.currentRobot().readGenericSensor(connector, sensorName);
    }

    //% shim=ENUM_GET
    //% blockId=servo_enum_shim_v4
    //% blockHidden=true
    //% block="$arg"
    //% enumName="ServoNameV4"
    //% enumMemberName="servo"
    //% enumPromptHint="eg: Claw"
    //% enumInitialMembers="Claw,Arm,Head"
    //% group="Servos"
    export function _servoEnumShim(arg: number): number {
        return arg;
    }

    /**
     * Fija el ángulo de un servo en el conector indicado.
     */
    //% blockId="butia_v4_servo_set_angle"
    //% blockHidden=true
    //% block="servo $servoName en $connector fijar ángulo a $degrees °"
    //% servoName.shadow="servo_enum_shim_v4"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=50
    //% group="Servos"
    export function servoSetAngle(servoName: number, connector: butia.v4.ButiaV4Connector, degrees: number): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().servoSetAngle(connector, servoName, degrees);
    }

    /**
     * Ejecuta el manejador cuando el sensor de distancia en el conector indicado cumple la comparación, con la prioridad indicada.
     */
    //% blockId="butia_v4_evt_distance"
    //% blockHidden=true
    //% block="cuando el sensor de distancia en %connector sea %op %threshold cm con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=65
    //% group="Eventos"
    export function onDistance(
        connector: butia.v4.ButiaV4Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().onDistance(connector, op, threshold, priority, handler);
    }

    /**
     * Ejecuta el manejador cuando el sensor de luz en el conector indicado cumple la comparación, con la prioridad indicada.
     */
    //% blockId="butia_v4_evt_light"
    //% blockHidden=true
    //% block="cuando el sensor de luz en %connector sea %op %threshold con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=60
    //% advanced=true
    export function onLight(
        connector: butia.v4.ButiaV4Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().onLight(connector, op, threshold, priority, handler);
    }

    /**
     * Ejecuta el manejador cuando el sensor de grises en el conector indicado cumple la comparación, con la prioridad indicada.
     */
    //% blockId="butia_v4_evt_gray"
    //% blockHidden=true
    //% block="cuando el sensor de grises en %connector sea %op %threshold con prioridad %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=55
    //% group="Eventos"
    export function onGray(
        connector: butia.v4.ButiaV4Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().onGray(connector, op, threshold, priority, handler);
    }

    /**
     * Ejecuta el manejador cuando el botón en el conector indicado alcanza el estado indicado, con la prioridad indicada.
     */
    //% blockId="butia_v4_evt_button"
    //% blockHidden=true
    //% block="cuando el botón en %connector se %state con prioridad %priority"
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=70
    //% advanced=true
    export function onButton(
        connector: butia.v4.ButiaV4Connector,
        state: ButiaButtonState,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV4);
        butia.RobotDriver.currentRobot().onConnectorButton(connector, state, priority, handler);
    }

}
