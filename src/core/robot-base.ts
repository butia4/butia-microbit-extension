// PXT does not support `abstract class` — this DI base class is the approved substitute.

class RobotBase implements IRobot{
    protected _motors: IMotorDriver
    protected _lights: ILightSensor[]
    protected _distances: IDistanceSensor[]
    protected _assistFlags: number
    protected connectorConfig:{ [key: string]: AnalogPin }
    _motorLeft: number = 0
    _motorRight: number = 0
    
    constructor(motors: IMotorDriver, connectorConfig: { [key: string]: AnalogPin }, distance: IDistanceSensor[], light: ILightSensor[]) {
        this._motors = motors
        this._distances = distance
        this._lights = light
        this.connectorConfig = connectorConfig
        this._assistFlags = 0
    }
    private _resolvePin(pin: string): AnalogPin {
        const resolved = this.connectorConfig[pin]
        if (resolved === undefined) {
            const available = Object.keys(this.connectorConfig).join(", ")
            control.fail("Pin " + pin + " not found. Available: " + available)
        }
        return resolved
    }
    private _findLightSensor(pin: AnalogPin): ILightSensor {
        for (const sensor of this._lights) {
            if (sensor.getPin() === pin) return sensor
        }
        control.fail("No light sensor found for pin " + pin)
        return null as any as ILightSensor
    }

    private _findDistanceSensor(pin: AnalogPin): IDistanceSensor {
        for (const sensor of this._distances) {
            if (sensor.getPin() === pin) return sensor
        }
        control.fail("No distance sensor found for pin " + pin)
        return null as any as IDistanceSensor
    }
    protected _setMotorSpeed(left: number, right: number): void {
        this._motorLeft = left
        this._motorRight = right
        this._motors.setSpeed(left, right)
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
    readDistanceSensor(pin: string): number {
        return this._findDistanceSensor(this._resolvePin(pin)).read()
    }
    readLightSensor(pin: string): number {
        return this._findLightSensor(this._resolvePin(pin)).read()
    }

    readGraySensor(pin: string): number {
        return 1023 - pins.analogReadPin(AnalogPin.P1)
    }

    

    
    
    
    
    
    
    
    
    
    
    
    
    
    start(): void {
        this._motors.init()
        this._distances.forEach(d => d.init())
        this._lights.forEach(l => l.init())
        control.inBackground(() => {
            while (true) {
                this._distances.forEach(d => d.poll())
                this._lights.forEach(l => l.poll())
                //this._applyAssists()
                basic.pause(POLL_INTERVAL_MS)
            }
        })
    }
    setSimDrivers(distance: IDistanceSensor): void {
        control.fail("Method not implemented")
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
    readButton(pin: string): boolean {
        //return pins.digitalReadPin(pin as DigitalPin) === 0
        control.fail("Method not implemented")
        return false
    }
    startMonitoring(sensor: number, pin: number, threshold: number): void {
        control.fail("Method not implemented")
        // Start monitoring a sensor for threshold crossing events
        /*let wasAbove = false
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
        })*/
    }

    onLevelReached(sensor: number, pin: number, handler: () => void): void {
        control.onEvent(3194, sensor * 1000 + pin * 100 + 1, handler)
    }

    onLevelUnreached(sensor: number, pin: number, handler: () => void): void {
        control.onEvent(3194, sensor * 1000 + pin * 100, handler)
    }

    startMonitoringButton(pin: number): void {
        control.fail("Method not implemented")
        /*let wasAbove = false
        control.inBackground(() => {
            while (true) {
                const isAbove = this.readButton(pin)
                if (isAbove && !wasAbove) {
                    control.raiseEvent(3194, 3 * 1000 + pin * 100 + 1)
                }
                wasAbove = isAbove
                basic.pause(20)
            }
        })*/
    }

    onButton(pin: number, handler: () => void): void {
        control.onEvent(3194, 3 * 1000 + pin * 100 + 1, handler)
    }
}
