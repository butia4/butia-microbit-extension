butiaV2.onGraySensorSees(butia.v2.J5, ButiaColor.Black, 3, function () {
    butiaV2.moveBackward(40, 0.2)
    butiaV2.turn(ButiaTurnDirection.Right, 40, 0.2)
})
butiaV2.onDistance(butia.v2.J2, ButiaComparison.GreaterOrEqual, 40, 1, function () {
    butiaV2.turn(ButiaTurnDirection.Right, 25)
})
butiaV2.onDistance(butia.v2.J2, ButiaComparison.Less, 40, 2, function () {
    butiaV2.moveForward(50)
})
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 3, function () {
    butiaV2.moveBackward(40, 0.2)
    butiaV2.turn(ButiaTurnDirection.Right, 40, 0.2)
})
butiaV2.selectMap(ButiaSimMap.CircleArena)
