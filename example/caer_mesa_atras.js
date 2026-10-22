butiaV4.onDistance(butia.v4.J2, ButiaComparison.Less, 20, 1, function () {
    butiaV4.moveBackward(20)
})
butiaV4.onDistance(butia.v4.J1, ButiaComparison.Greater, 20, 2, function () {
    butiaV4.moveForward(20, 1)
    butiaV4.turn(ButiaTurnDirection.Right, 12, 1)
})
butiaV4.onDistance(butia.v4.J2, ButiaComparison.Greater, 20, 2, function () {
    butiaV4.moveForward(20, 1)
    butiaV4.turn(ButiaTurnDirection.Left, 12, 1)
})
butiaV4.onDistance(butia.v4.J1, ButiaComparison.Less, 20, 1, function () {
    butiaV4.moveBackward(20)
})
butiaV4.selectMap(ButiaSimMap.Table)
