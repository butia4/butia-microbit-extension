declare const enum Connector {
    //% block="Puerto 1"
    Port1 = 0,
    //% block="Puerto 2"
    Port2 = 1,
    //% block="Puerto 3"
    Port3 = 2,
    //% block="Puerto 4"
    Port4 = 3,
    //% block="Puerto 5"
    Port5 = 4,
    //% block="Puerto 6"
    Port6 = 5,
    //% block="Puerto 7"
    Port7 = 6,
    //% block="Puerto 8"
    Port8 = 7,
    //% block="Puerto 9"
    Port9 = 8,
    //% block="Puerto 10"
    Port10 = 9,
    //% block="Puerto 11"
    Port11 = 10,
    //% block="Puerto 12"
    Port12 = 11,
    //% block="Puerto 13"
    Port13 = 12,
    //% block="Puerto 14"
    Port14 = 13,
    //% block="Puerto 15"
    Port15 = 14,
    //% block="Puerto 16"
    Port16 = 15,
    //% block="Puerto 17"
    Port17 = 16,
    //% block="Puerto 18"
    Port18 = 17,
    //% block="Puerto 19"
    Port19 = 18,
}

declare const enum RobotModel {
    //% block="Butia v4"
    Butia4 = 0,
    //% block="Butia v3"
    Butia3 = 1,
}

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
