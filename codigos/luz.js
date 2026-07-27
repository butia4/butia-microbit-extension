Butia.onLight(Butia.J2, Comparison.Greater, 20, 1, function () {
    Butia.turn(TurnDirection.Right, 10, 0.5)
    Butia.moveForward(20, 0.5)
})
Butia.onLight(Butia.J1, Comparison.Greater, 20, 1, function () {
    Butia.turn(TurnDirection.Left, 10, 0.5)
    Butia.moveForward(20, 0.5)
})
Butia.setMap(SimMap.Luz)
