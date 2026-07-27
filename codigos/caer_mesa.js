Butia.onDistance(Butia.J2, Comparison.Less, 20, 1, function () {
    Butia.moveForward(20)
})
Butia.onDistance(Butia.J1, Comparison.Greater, 20, 2, function () {
    Butia.moveBackward(20, 1)
    Butia.turn(TurnDirection.Right, 12, 1)
})
Butia.onDistance(Butia.J2, Comparison.Greater, 20, 2, function () {
    Butia.moveBackward(20, 1)
    Butia.turn(TurnDirection.Left, 12, 1)
})
Butia.onDistance(Butia.J1, Comparison.Less, 20, 1, function () {
    Butia.moveForward(20)
})
Butia.setMap(SimMap.Mesa)
