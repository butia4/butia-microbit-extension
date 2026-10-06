butiaV2.selectMap(ButiaSimMap.CircleArena)
butiaV2.onDistance(butia.v2.J3, ButiaComparison.GreaterOrEqual, 30, 1, function () {
    butiaV2.turn(ButiaTurnDirection.Right, 25)
})
butiaV2.onDistance(butia.v2.J3, ButiaComparison.Less, 30, 2, function () {
    butiaV2.moveForward(50)
})
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 3, function () {
    butiaV2.moveBackward(40, 1)
    butiaV2.turn(ButiaTurnDirection.Right, 40, 1)
})
butiaV2.onGraySensorSees(butia.v2.J2, ButiaColor.Black, 3, function () {
    butiaV2.moveBackward(40, 1)
    butiaV2.turn(ButiaTurnDirection.Right, 40, 1)
})
