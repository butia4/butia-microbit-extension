butiaV4.onGray(butia.v4.J2, ButiaComparison.Less, 17, 1, function () {
    butiaV4.moveForward(20)
})
butiaV4.onGray(butia.v4.J1, ButiaComparison.Less, 17, 1, function () {
    butiaV4.moveForward(20)
})
butiaV4.onGray(butia.v4.J1, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    butiaV4.turn(ButiaTurnDirection.Left, 10, 0.5)
})
butiaV4.onGray(butia.v4.J2, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    butiaV4.turn(ButiaTurnDirection.Right, 10, 0.5)
})
butiaV4.selectMap(ButiaSimMap.LineFollower)

