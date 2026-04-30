// PXT does not support `abstract class` — this DI base class is the approved substitute.

class RobotBase implements IRobot{
    protected _motors: IMotorDriver
    protected _line: ILineSensor
    protected _light: ILightSensor
    protected _distance: IDistanceSensor
    protected _assistFlags: number
    _motorLeft: number = 0
    _motorRight: number = 0


    constructor(motors: IMotorDriver, line: ILineSensor, distance: IDistanceSensor, light: ILightSensor) {
        this._motors = motors
        this._line = line
        this._distance = distance
        this._assistFlags = 0
        this._light = light
    }

    protected _setMotorSpeed(left: number, right: number): void {
        this._motorLeft = left
        this._motorRight = right
        this._motors.setSpeed(left, right)
    }
    start(): void {
        this._motors.init()
        this._line.init()
        this._distance.init()
        control.inBackground(() => {
            while (true) {
                this._line.poll()
                this._distance.poll()
                //this._applyAssists()
                basic.pause(POLL_INTERVAL_MS)
            }
        })
    }
    setSimDrivers(line: ILineSensor, distance: IDistanceSensor): void {
        this._line = line
        this._distance = distance
    }
    moveForward(speed: number, duration?: number): void {
        this._setMotorSpeed(speed, speed)
        if (duration) {
            basic.pause(duration)
            this._setMotorSpeed(0, 0)
        }
    }
    moveBackward(speed: number = 70, duration?: number): void {
        this._setMotorSpeed(-speed, -speed)

        if (duration !== undefined) {
            basic.pause(duration)
            this._setMotorSpeed(0, 0)
        }
    }
    turn(direction: TurnDirection, speed: number = 60, duration?: number): void {
        if (direction === TurnDirection.Left) {
            this._setMotorSpeed(-speed, speed)
        } else {
            this._setMotorSpeed(speed, -speed)
        }

        if (duration !== undefined) {
            basic.pause(duration)
            this._setMotorSpeed(0, 0)
        }
    }
    motorTank(left: number, right: number): void {
        this._setMotorSpeed(left, right)
    }
    motorStop(): void {
        this._setMotorSpeed(0, 0)
    }
    detectLine(id: LineSensorId): boolean {
        control.fail("Method not implemented");
        return false;
        // return id === LineSensorId.Left ? this._line.readLeft() : this._line.readRight()
    }
    obstacleDistance(): number {
        //control.fail("Method not implemented")
        //return 0;
        return this._distance.readCm()
    }
    setAssist(flag: RobotAssist, enabled: boolean): void {

        control.fail("Method not implemented")
        /*if (enabled) {
            this._assistFlags = this._assistFlags | flag
        } else {
            this._assistFlags = this._assistFlags & ~flag
        }*/
    }

    /*
    protected _applyAssists(): void {
        if ((this._assistFlags & RobotAssist.ObstacleStop) !== 0) {
            if (this._distance.read() <= OBSTACLE_STOP_DISTANCE_CM) {
                this._motors.stop()
            }
        }
    }*/

    readGraySensor(pin: number): number {
        return 1023 - pins.analogReadPin(AnalogPin.P1)
    }

    readLightSensor(pin: number): number {
        return this._light.readCm()
    }

    readButton(pin: number): boolean {
        return pins.digitalReadPin(pin as DigitalPin) === 0
    }

    startMonitoring(sensor: number, pin: number, threshold: number): void {
        // Start monitoring a sensor for threshold crossing events
        let wasAbove = false
        control.inBackground(() => {
            let cooldown = 5
            while (true) {
                let value
                if (sensor === 2) { // Gray
                    value = this.readGraySensor(pin)
                } else if (sensor === 1) { // Light
                    value = this.readLightSensor(pin)
                } else {
                    value = 0
                }

                const isAbove = value >= threshold
                if (cooldown > 0) {
                    cooldown = cooldown - 1
                } else {
                    if (isAbove && !wasAbove) {
                        control.raiseEvent(3194, sensor * 1000 + pin * 100 + 1)
                        cooldown = 5
                    }
                    if (!isAbove && wasAbove) {
                        control.raiseEvent(3194, sensor * 1000 + pin * 100)
                        cooldown = 5
                    }
                }
                wasAbove = isAbove
                basic.pause(20)
            }
        })
    }

    onLevelReached(sensor: number, pin: number, handler: () => void): void {
        control.onEvent(3194, sensor * 1000 + pin * 100 + 1, handler)
    }

    onLevelUnreached(sensor: number, pin: number, handler: () => void): void {
        control.onEvent(3194, sensor * 1000 + pin * 100, handler)
    }

    startMonitoringButton(pin: number): void {
        let wasAbove = false
        control.inBackground(() => {
            while (true) {
                const isAbove = this.readButton(pin)
                if (isAbove && !wasAbove) {
                    control.raiseEvent(3194, 3 * 1000 + pin * 100 + 1)
                }
                wasAbove = isAbove
                basic.pause(20)
            }
        })
    }

    onButton(pin: number, handler: () => void): void {
        control.onEvent(3194, 3 * 1000 + pin * 100 + 1, handler)
    }
}
