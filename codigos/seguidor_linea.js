Butia.onGray(Butia.J2, ButiaComparison.Less, 17, 1, function () {
    Butia.moveForward(20)
})
Butia.onGray(Butia.J1, ButiaComparison.Less, 17, 1, function () {
    Butia.moveForward(20)
})
Butia.onGray(Butia.J1, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    Butia.turn(ButiaTurnDirection.Left, 10, 0.5)
})
Butia.onGray(Butia.J2, ButiaComparison.GreaterOrEqual, 17, 2, function () {
    Butia.turn(ButiaTurnDirection.Right, 10, 0.5)
})
Butia.setMap(ButiaSimMap.LineFollower)

