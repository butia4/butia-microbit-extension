// Enums stay in the global namespace, as MakeCode's naming conventions allow,
// but carry a Butia prefix so they cannot collide with another extension.

declare const enum ButiaTurnDirection {
    //% block="izquierda"
    Left = 0,
    //% block="derecha"
    Right = 1,
}

declare const enum ButiaComparison {
    //% block="mayor que"
    Greater = 0,
    //% block="menor que"
    Less = 1,
    //% block="mayor o igual que"
    GreaterOrEqual = 2,
    //% block="menor o igual que"
    LessOrEqual = 3,
}

declare const enum ButiaButtonState {
    //% block="presione"
    Pressed = 0,
    //% block="suelte"
    Released = 1,
}

declare const enum ButiaMotorSide {
    //% block="izquierdo"
    Left = 0,
    //% block="derecho"
    Right = 1,
}

declare const enum ButiaColor {
    //% block="negro"
    Black = 0,
    //% block="blanco"
    White = 1,
}

// Value 0 is reserved as an "unset" sentinel for the botsim wire protocol.
// The numeric values are the protocol: botsim resolves maps by id
// (botsim/src/maps/registry.ts), never by member name. Ids 1-3 belonged to
// retired maps and stay reserved so stale saved programs cannot hit a new map.
declare const enum ButiaSimMap {
    //% block="línea A a B"
    LineAToB = 4,
    //% block="arena circular"
    CircleArena = 5,
}
