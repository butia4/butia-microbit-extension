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

declare const enum ButiaColor {
    //% block="black"
    Black = 0,
    //% block="white"
    White = 1,
}

// Value 0 is reserved as an "unset" sentinel for the botsim wire protocol.
// The numeric values are the protocol: botsim resolves maps by id
// (botsim/src/maps/registry.ts), never by member name. Ids 1-3 belonged to
// retired maps and stay reserved so stale saved programs cannot hit a new map.
declare const enum ButiaSimMap {
    //% block="line A to B"
    LineAToB = 4,
    //% block="circle arena"
    CircleArena = 5,
}
