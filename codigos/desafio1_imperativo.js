butiaV2.selectMap(ButiaSimMap.LineAToB)
basic.forever(function () {
    if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black)) {
        butiaV2.turn(ButiaTurnDirection.Left, 10)
    } else if (butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {
        butiaV2.turn(ButiaTurnDirection.Right, 10)
    } else {
        butiaV2.moveForward(30)
    }
})
