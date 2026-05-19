declare const enum TurnDirection {
    //% block="left"
    Left = 0,
    //% block="right"
    Right = 1,
}

declare const enum Comparison {
    //% block="mayor que"
    Greater = 0,
    //% block="menor que"
    Less = 1,
    //% block="mayor o igual que"
    GreaterOrEqual = 2,
    //% block="menor o igual que"
    LessOrEqual = 3,
}

declare const enum ButtonState {
    //% block="presione"
    Pressed = 0,
    //% block="suelte"
    Released = 1,
}

declare const enum DurationSeconds {
    //% block="0.5 segundos"
    HalfSecond = 500,

    //% block="1 segundo"
    OneSecond = 1000,

    //% block="2 segundos"
    TwoSeconds = 2000,

    //% block="5 segundos"
    FiveSeconds = 5000
}