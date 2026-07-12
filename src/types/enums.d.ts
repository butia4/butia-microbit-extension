declare const enum TurnDirection {
    //% block="izquierda"
    Left = 0,
    //% block="derecha"
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

declare const enum MotorSide {
    //% block="Izquierdo"
    Left = 0,
    //% block="Derecho"
    Right = 1,
}

// Named `SimMap` (not `Map`) to avoid shadowing the ES2015 `Map<K,V>` built-in.
// Value 0 is reserved as an "unset" sentinel for the botsim wire protocol.
declare const enum SimMap {
    //% block="Seguidor de línea"
    SeguidorDeLinea = 1,
    //% block="Mesa"
    Mesa = 2,
    //% block="Luz"
    Luz = 3,
}