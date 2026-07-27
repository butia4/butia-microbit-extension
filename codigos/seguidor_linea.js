Butia.onGray(Butia.J2, Comparison.Less, 17, 1, function () {
    Butia.moveForward(20)
})
Butia.onGray(Butia.J1, Comparison.Less, 17, 1, function () {
    Butia.moveForward(20)
})
Butia.onGray(Butia.J1, Comparison.GreaterOrEqual, 17, 2, function () {
    Butia.turn(TurnDirection.Left, 10, 0.5)
})
Butia.onGray(Butia.J2, Comparison.GreaterOrEqual, 17, 2, function () {
    Butia.turn(TurnDirection.Right, 10, 0.5)
})
Butia.setMap(SimMap.SeguidorDeLinea)

