// PXT does not support `abstract class` — this DI base class is the approved substitute.

class RobotBase implements IRobot {
    protected _motors: IMotorDriver
    protected _line: ILineSensor
    protected _distance: IDistanceSensor
    protected _assistFlags: number
    _motorLeft: number = 0
    _motorRight: number = 0

    constructor(motors: IMotorDriver, line: ILineSensor, distance: IDistanceSensor) {
        this._motors = motors
        this._line = line
        this._distance = distance
        this._assistFlags = 0
    }

    setSimDrivers(line: ILineSensor, distance: IDistanceSensor): void {
        this._line = line
        this._distance = distance
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
                this._applyAssists()
                basic.pause(POLL_INTERVAL_MS)
            }
        })
    }

    protected _applyAssists(): void {
        if ((this._assistFlags & RobotAssist.ObstacleStop) !== 0) {
            if (this._distance.read() <= OBSTACLE_STOP_DISTANCE_CM) {
                this._motors.stop()
            }
        }
    }

    moveForward(speed: number = 70, duration?: number): void {
        this._setMotorSpeed(speed, speed)
        if (duration !== undefined) {
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
        return id === LineSensorId.Left ? this._line.readLeft() : this._line.readRight()
    }

    obstacleDistance(): number {
        return this._distance.read()
    }

    setAssist(flag: RobotAssist, enabled: boolean): void {
        if (enabled) {
            this._assistFlags = this._assistFlags | flag
        } else {
            this._assistFlags = this._assistFlags & ~flag
        }
    }
}
