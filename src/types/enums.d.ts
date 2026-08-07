// Enums stay in the global namespace, as MakeCode's naming conventions allow,
// but carry a Butia prefix so they cannot collide with another extension.

declare const enum ButiaTurnDirection {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

declare const enum ButiaComparison {
    //% block="greater than"
    Greater = 0,
    //% block="less than"
    Less = 1,
    //% block="greater than or equal to"
    GreaterOrEqual = 2,
    //% block="less than or equal to"
    LessOrEqual = 3,
}

declare const enum ButiaButtonState {
    //% block="pressed"
    Pressed = 0,
    //% block="released"
    Released = 1,
}

declare const enum ButiaMotorSide {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

// Value 0 is reserved as an "unset" sentinel for the botsim wire protocol.
// The numeric values are the protocol: botsim resolves maps by id
// (botsim/src/maps/*.ts), never by member name.
declare const enum ButiaSimMap {
    //% block="line follower"
    LineFollower = 1,
    //% block="table"
    Table = 2,
    //% block="light"
    Light = 3,
}
