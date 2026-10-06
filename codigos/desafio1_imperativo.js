butiaV4.selectMap(ButiaSimMap.LineAToB)
basic.forever(function () {
    if (butiaV4.graySensorSees(butia.v4.J1, ButiaColor.Black)) {
        butiaV4.turn(ButiaTurnDirection.Left, 10)
    } else if (butiaV4.graySensorSees(butia.v4.J2, ButiaColor.Black)) {
        butiaV4.turn(ButiaTurnDirection.Right, 10)
    } else {
        butiaV4.moveForward(30)
    }
})
