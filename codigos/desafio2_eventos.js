butiaV4.selectMap(ButiaSimMap.CircleArena)
butiaV4.onDistance(butia.v4.J3, ButiaComparison.GreaterOrEqual, 30, 1, function () {
    butiaV4.turn(ButiaTurnDirection.Right, 25)
})
butiaV4.onDistance(butia.v4.J3, ButiaComparison.Less, 30, 2, function () {
    butiaV4.moveForward(50)
})
butiaV4.onGraySensorSees(butia.v4.J1, ButiaColor.Black, 3, function () {
    butiaV4.moveBackward(40, 1)
    butiaV4.turn(ButiaTurnDirection.Right, 40, 1)
})
butiaV4.onGraySensorSees(butia.v4.J2, ButiaColor.Black, 3, function () {
    butiaV4.moveBackward(40, 1)
    butiaV4.turn(ButiaTurnDirection.Right, 40, 1)
})
