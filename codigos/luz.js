butia.onLight(butia.J2, ButiaComparison.Greater, 20, 1, function () {
    butia.turn(ButiaTurnDirection.Right, 10, 0.5)
    butia.moveForward(20, 0.5)
})
butia.onLight(butia.J1, ButiaComparison.Greater, 20, 1, function () {
    butia.turn(ButiaTurnDirection.Left, 10, 0.5)
    butia.moveForward(20, 0.5)
})
butia.setMap(ButiaSimMap.Light)
