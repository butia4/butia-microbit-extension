butia.onGray(butia.J2, ButiaComparison.Less, 17, 1, function () {
    butia.moveForward(20)
})
butia.onGray(butia.J1, ButiaComparison.Less, 17, 1, function () {
    butia.moveForward(20)
})
butia.onGray(butia.J1, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    butia.turn(ButiaTurnDirection.Left, 10, 0.5)
})
butia.onGray(butia.J2, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    butia.turn(ButiaTurnDirection.Right, 10, 0.5)
})
butia.setMap(ButiaSimMap.LineFollower)

