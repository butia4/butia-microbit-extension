butiaV2.selectMap(ButiaSimMap.LineAToB)
basic.forever(function () {
    if (butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {
        butiaV2.turn(ButiaTurnDirection.Right, 50, 0.3)
    } else if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black)) {
        butiaV2.turn(ButiaTurnDirection.Left, 50, 0.3)
    } else {
        butiaV2.moveForward(50)
    }
    // radio.sendValue("Gris", butiaV2.readGraySensor(butia.v2.J1))
})
