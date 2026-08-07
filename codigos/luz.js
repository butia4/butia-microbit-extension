Butia.onLight(Butia.J2, ButiaComparison.Greater, 20, 1, function () {
    Butia.turn(ButiaTurnDirection.Right, 10, 0.5)
    Butia.moveForward(20, 0.5)
})
Butia.onLight(Butia.J1, ButiaComparison.Greater, 20, 1, function () {
    Butia.turn(ButiaTurnDirection.Left, 10, 0.5)
    Butia.moveForward(20, 0.5)
})
Butia.setMap(ButiaSimMap.Light)
