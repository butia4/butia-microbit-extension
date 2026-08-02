declare const enum TurnDirection {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

declare const enum Comparison {
    //% block="greater than"
    Greater = 0,
    //% block="less than"
    Less = 1,
    //% block="greater than or equal to"
    GreaterOrEqual = 2,
    //% block="less than or equal to"
    LessOrEqual = 3,
}

declare const enum ButtonState {
    //% block="pressed"
    Pressed = 0,
    //% block="released"
    Released = 1,
}

declare const enum MotorSide {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

// Named `SimMap` (not `Map`) to avoid shadowing the ES2015 `Map<K,V>` built-in.
// Value 0 is reserved as an "unset" sentinel for the botsim wire protocol.
declare const enum SimMap {
    //% block="line follower"
    SeguidorDeLinea = 1,
    //% block="table"
    Mesa = 2,
    //% block="light"
    Luz = 3,
}