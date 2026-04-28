declare const enum TurnDirection {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

declare const enum LineSensorId {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

declare const enum RobotAssist {
    //% block="line assist"
    LineAssist = 1 << 0,
    //% block="obstacle stop"
    ObstacleStop = 1 << 1,
}

declare const enum ButiaEvent {
    LineLeftDetected = 1,
    LineRightDetected = 2,
    LineBothDetected = 3,
    LineNoneDetected = 4,
    ObstacleNear = 5,
    ObstacleFar = 6,
}
