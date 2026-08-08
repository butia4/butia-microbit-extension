//% color="#84c324" icon="\uf057" block="Butia"
//% groups="['Motors', 'Sensors', 'Generic Sensors', 'Servos', 'Simulator']"
namespace butia {


    //% blockId="butia_imp_move_forward"
    //% block="move forward at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=100
    //% group="Motors"
    export function moveForward(speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveForward(speed, ms);
    }

    //% blockId="butia_imp_move_backward"
    //% block="move backward at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% duration.min=0
    //% duration.defl=0
    //% weight=95
    //% group="Motors"
    export function moveBackward(speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : 0;
        butia.RobotDriver.currentRobot().moveBackward(speed, ms);
    }

    //% blockId="butia_imp_turn"
    //% block="turn %direction at speed %speed || for %duration seconds"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% duration.min=0
    //% duration.defl=0
    //% weight=90
    //% group="Motors"
    export function turn(direction: ButiaTurnDirection, speed: number, duration?: number): void {
        const ms = duration ? duration * 1000 : undefined;
        butia.RobotDriver.currentRobot().turn(direction, speed, ms);
    }

    //% blockId="butia_imp_motor_tank"
    //% block="motor left %left right %right"
    //% left.min=-100 left.max=100 left.defl=70
    //% right.min=-100 right.max=100 right.defl=70
    //% weight=85
    //% group="Motors"
    export function motorTank(left: number, right: number): void {
        butia.RobotDriver.currentRobot().motorTank(left, right);
    }

    //% blockId="butia_imp_stop"
    //% block="stop motors"
    //% weight=80
    //% group="Motors"
    export function motorStop(): void {
        butia.RobotDriver.currentRobot().motorStop();
    }

    //% blockId="butia_imp_stop_single"
    //% block="stop motor %motor"
    //% weight=79
    //% group="Motors"
    export function motorStopSingle(motor: ButiaMotorSide): void {
        if (motor === ButiaMotorSide.Left) {
            butia.RobotDriver.currentRobot().motorTank(0, butia.RobotDriver.currentRobot().motorRight());
        } else {
            butia.RobotDriver.currentRobot().motorTank(butia.RobotDriver.currentRobot().motorLeft(), 0);
        }
    }

    //% blockId="butia_imp_read_gray"
    //% block="gray sensor on %connector"
    //% weight=70
    //% group="Sensors"
    export function readGraySensor(connector: butia.Connector): number {
        return butia.RobotDriver.currentRobot().readGraySensor(connector);
    }

    //% blockId="butia_imp_read_light"
    //% block="light sensor on %connector"
    //% weight=69
    //% group="Sensors"
    export function readLightSensor(connector: butia.Connector): number {
        return butia.RobotDriver.currentRobot().readLightSensor(connector);
    }

    //% blockId="butia_imp_distance"
    //% block="distance sensor on %connector"
    //% weight=69
    //% group="Sensors"
    export function obstacleDistance(connector: butia.Connector): number {
        return butia.RobotDriver.currentRobot().readDistanceSensor(connector);
    }

    //% blockId="butia_imp_read_button"
    //% block="button on %connector pressed"
    //% weight=68
    //% group="Sensors"
    export function readButton(connector: butia.Connector): boolean {
        return butia.RobotDriver.currentRobot().readButton(connector);
    }
    //% shim=ENUM_GET
    //% blockId=sensor_enum_shim
    //% blockHidden=true
    //% block="$arg"
    //% enumName="SensorName"
    //% enumMemberName="sensor"
    //% enumPromptHint="eg: Humidity"
    //% enumInitialMembers="Humidity,Pressure,Sound"
    //% group="Generic Sensors"
    export function _sensorEnumShim(arg: number): number {
        return arg;
    }
    //% blockId="butia_imp_read_generic"
    //% block="$sensorName sensor on $connector"
    //% sensorName.shadow="sensor_enum_shim"
    //% weight=67
    //% group="Generic Sensors"
    export function readGenericSensor(sensorName: number, connector: butia.Connector): number {
        return butia.RobotDriver.currentRobot().readGenericSensor(connector, sensorName);
    }
    
    //% shim=ENUM_GET
    //% blockId=servo_enum_shim
    //% blockHidden=true
    //% block="$arg"
    //% enumName="ServoName"
    //% enumMemberName="servo"
    //% enumPromptHint="eg: Claw"
    //% enumInitialMembers="Claw,Arm,Head"
    //% group="Servos"
    export function _servoEnumShim(arg: number): number {
        return arg;
    }

    //% blockId="butia_servo_set_angle"
    //% block="servo $servoName on $connector set angle to $degrees °"
    //% servoName.shadow="servo_enum_shim"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% weight=50
    //% group="Servos"
    export function servoSetAngle(servoName: number, connector: butia.Connector, degrees: number): void {
        butia.RobotDriver.currentRobot().servoSetAngle(connector, servoName, degrees);
    }

    //% blockId="butia_evt_distance"
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
        butia.RobotDriver.currentRobot().onDistance(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_light"
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
        butia.RobotDriver.currentRobot().onLight(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_gray"
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
        butia.RobotDriver.currentRobot().onGray(connector, op, threshold, priority, handler);
    }

    //% blockId="butia_evt_button"
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
        butia.RobotDriver.currentRobot().onConnectorButton(connector, state, priority, handler);
    }

    //% blockId="butia_sim_set_map"
    //% block="use map %map"
    //% weight=50
    //% group="Simulator"
    export function setMap(map: ButiaSimMap): void {
        _simSelectMap(map);
    }

}
