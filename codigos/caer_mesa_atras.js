Butia.onDistance(Butia.J2, ButiaComparison.Less, 20, 1, function () {
    Butia.moveBackward(20)
})
Butia.onDistance(Butia.J1, ButiaComparison.Greater, 20, 2, function () {
    Butia.moveForward(20, 1)
    Butia.turn(ButiaTurnDirection.Right, 12, 1)
})
Butia.onDistance(Butia.J2, ButiaComparison.Greater, 20, 2, function () {
    Butia.moveForward(20, 1)
    Butia.turn(ButiaTurnDirection.Left, 12, 1)
})
Butia.onDistance(Butia.J1, ButiaComparison.Less, 20, 1, function () {
    Butia.moveBackward(20)
})
Butia.setMap(ButiaSimMap.Table)
