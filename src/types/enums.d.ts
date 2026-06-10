declare const enum TurnDirection {
    //% block="derecha"
    Left = 0,
    //% block="izquierda"
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

declare const enum ReactiveAction {
    //% block="avanzar"
    Forward = 0,
    //% block="retroceder"
    Backward = 1,
    //% block="detener"
    Stop = 2,
    //% block="girar izquierda"
    TurnLeft = 3,
    //% block="girar derecha"
    TurnRight = 4,
    /*//% block="desviar"
    Divert = 5,
    //% block="rodeo"
    ArcAround = 6,*/
}

declare const enum MotorTarget {
    //% block="ambos motores"
    Both = 0,
    //% block="motor izquierdo"
    Left = 1,
    //% block="motor derecho"
    Right = 2,
}

declare const enum ArcSide {
    //% block="izquierda"
    Left = 0,
    //% block="derecha"
    Right = 1,
}

declare const enum ReactiveSensorType {
    //% block="grises"
    Gray = 0,
    //% block="distancia"
    Distance = 1,
    //% block="luz"
    Light = 2,
    //% block="botón"
    Button = 3,
}
