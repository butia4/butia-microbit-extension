//% color="#2E86AB" icon="" block="Butia v2"
//% groups="['Motors', 'Sensors', 'Generic Sensors', 'Servos']"
namespace butiaV2 {

    /**
     * Selects which botsim map to run against. The robot itself starts
     * automatically the first time any other Butia v2 block runs — no
     * separate "start" block is needed.
     */
    //% blockId="butia_v2_select_map"
    //% block="Butia v2 use map %map"
    //% weight=111
    export function selectMap(map: ButiaSimMap): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia._simSelectMap(map);
    }

    /**
     * Drives both motors forward. Runs indefinitely, or for the given duration if set.
     */
    //% blockId="butia_v2_imp_move_forward"
    //% block="move forward at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=100
    //% group="Motors"
    export function moveForward(speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV2);
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveForward(speed, ms);
    }

    /**
     * Drives both motors backward. Runs indefinitely, or for the given duration if set.
     */
    //% blockId="butia_v2_imp_move_backward"
    //% block="move backward at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=95
    //% group="Motors"
    export function moveBackward(speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV2);
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveBackward(speed, ms);
    }

    /**
     * Turns in place toward the given direction.
     */
    //% blockId="butia_v2_imp_turn"
    //% block="turn %direction at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.min=0
    //% duration.defl=0
    //% weight=90
    //% group="Motors"
    export function turn(direction: ButiaTurnDirection, speed: number, duration?: number): void {
        butia.RobotDriver.start(butia.butiaV2);
        const ms = duration ? duration * 1000 : undefined;
        butia.RobotDriver.currentRobot().turn(direction, speed, ms);
    }

    /**
     * Sets each motor's speed independently (tank drive).
     */
    //% blockId="butia_v2_imp_motor_tank"
    //% block="motor left %left right %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motors"
    export function motorTank(left: number, right: number): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().motorTank(left, right);
    }

    /**
     * Stops both motors.
     */
    //% blockId="butia_v2_imp_stop"
    //% block="stop motors"
    //% weight=80
    //% group="Motors"
    export function motorStop(): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().motorStop();
    }

    /**
     * Stops a single motor, leaving the other running.
     */
    //% blockId="butia_v2_imp_stop_single"
    //% block="stop motor %motor"
    //% weight=79
    //% group="Motors"
    export function motorStopSingle(motor: ButiaMotorSide): void {
        butia.RobotDriver.start(butia.butiaV2);
        if (motor === ButiaMotorSide.Left) {
            butia.RobotDriver.currentRobot().motorTank(0, butia.RobotDriver.currentRobot().motorRight());
        } else {
            butia.RobotDriver.currentRobot().motorTank(butia.RobotDriver.currentRobot().motorLeft(), 0);
        }
    }

    /**
     * Reads the analog gray/line sensor on the given connector (0-100, higher = darker).
     */
    //% blockId="butia_v2_imp_read_gray"
    //% block="gray sensor on %connector"
    //% weight=70
    //% group="Sensors"
    export function readGraySensor(connector: butia.Connector): number {
        butia.RobotDriver.start(butia.butiaV2);
        return butia.RobotDriver.currentRobot().readGraySensor(connector);
    }

    /**
     * Reads the light sensor on the given connector (0-100).
     */
    //% blockId="butia_v2_imp_read_light"
    //% block="light sensor on %connector"
    //% weight=69
    //% group="Sensors"
    export function readLightSensor(connector: butia.Connector): number {
        butia.RobotDriver.start(butia.butiaV2);
        return butia.RobotDriver.currentRobot().readLightSensor(connector);
    }

    /**
     * Reads the distance sensor on the given connector, in cm.
     */
    //% blockId="butia_v2_imp_distance"
    //% block="distance sensor on %connector"
    //% weight=69
    //% group="Sensors"
    export function obstacleDistance(connector: butia.Connector): number {
        butia.RobotDriver.start(butia.butiaV2);
        return butia.RobotDriver.currentRobot().readDistanceSensor(connector);
    }

    /**
     * Whether the button on the given connector is currently pressed.
     */
    //% blockId="butia_v2_imp_read_button"
    //% block="button on %connector pressed"
    //% weight=68
    //% group="Sensors"
    export function readButton(connector: butia.Connector): boolean {
        butia.RobotDriver.start(butia.butiaV2);
        return butia.RobotDriver.currentRobot().readButton(connector);
    }

    //% shim=ENUM_GET
    //% blockId=sensor_enum_shim_v2
    //% blockHidden=true
    //% block="$arg"
    //% enumName="SensorNameV2"
    //% enumMemberName="sensor"
    //% enumPromptHint="eg: Humidity"
    //% enumInitialMembers="Humidity,Pressure,Sound"
    //% group="Generic Sensors"
    export function _sensorEnumShim(arg: number): number {
        return arg;
    }

    /**
     * Reads a generic analog sensor. Pick an existing name or create one from the dropdown.
     */
    //% blockId="butia_v2_imp_read_generic"
    //% block="$sensorName sensor on $connector"
    //% sensorName.shadow="sensor_enum_shim_v2"
    //% weight=67
    //% group="Generic Sensors"
    export function readGenericSensor(sensorName: number, connector: butia.Connector): number {
        butia.RobotDriver.start(butia.butiaV2);
        return butia.RobotDriver.currentRobot().readGenericSensor(connector, sensorName);
    }

    //% shim=ENUM_GET
    //% blockId=servo_enum_shim_v2
    //% blockHidden=true
    //% block="$arg"
    //% enumName="ServoNameV2"
    //% enumMemberName="servo"
    //% enumPromptHint="eg: Claw"
    //% enumInitialMembers="Claw,Arm,Head"
    //% group="Servos"
    export function _servoEnumShim(arg: number): number {
        return arg;
    }

    /**
     * Sets a servo's angle on the given connector.
     */
    //% blockId="butia_v2_servo_set_angle"
    //% block="servo $servoName on $connector set angle to $degrees °"
    //% servoName.shadow="servo_enum_shim_v2"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=50
    //% group="Servos"
    export function servoSetAngle(servoName: number, connector: butia.Connector, degrees: number): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().servoSetAngle(connector, servoName, degrees);
    }

    /**
     * Runs the handler when the distance sensor on the given connector matches the comparison, at the given priority.
     */
    //% blockId="butia_v2_evt_distance"
    //% block="when distance sensor on %connector is %op %threshold cm with priority %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=65
    //% advanced=true
    export function onDistance(
        connector: butia.Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().onDistance(connector, op, threshold, priority, handler);
    }

    /**
     * Runs the handler when the light sensor on the given connector matches the comparison, at the given priority.
     */
    //% blockId="butia_v2_evt_light"
    //% block="when light sensor on %connector is %op %threshold with priority %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=60
    //% advanced=true
    export function onLight(
        connector: butia.Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().onLight(connector, op, threshold, priority, handler);
    }

    /**
     * Runs the handler when the gray sensor on the given connector matches the comparison, at the given priority.
     */
    //% blockId="butia_v2_evt_gray"
    //% block="when gray sensor on %connector is %op %threshold with priority %priority"
    //% threshold.defl=20 threshold.min=1 threshold.max=100
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=55
    //% advanced=true
    export function onGray(
        connector: butia.Connector,
        op: ButiaComparison,
        threshold: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().onGray(connector, op, threshold, priority, handler);
    }

    /**
     * Runs the handler when the given sensor on the connector reads a value inside [min, max], at the given priority.
     */
    //% blockId="butia_v2_evt_sensor_range"
    //% block="when %sensorType sensor on %connector is between %min and %max with priority %priority"
    //% min.defl=20 max.defl=60
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=63
    //% advanced=true
    export function onSensorInRange(
        sensorType: ButiaSensorType,
        connector: butia.Connector,
        min: number,
        max: number,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().onSensorInRange(sensorType, connector, min, max, priority, handler);
    }

    /**
     * Runs the handler when the button on the given connector reaches the given state, at the given priority.
     */
    //% blockId="butia_v2_evt_button"
    //% block="when button on %connector is %state with priority %priority"
    //% priority.defl=1 priority.min=1 priority.max=5
    //% weight=70
    //% advanced=true
    export function onButton(
        connector: butia.Connector,
        state: ButiaButtonState,
        priority: number,
        handler: () => void
    ): void {
        butia.RobotDriver.start(butia.butiaV2);
        butia.RobotDriver.currentRobot().onConnectorButton(connector, state, priority, handler);
    }

}
