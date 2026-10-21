butiaV4.onLight(butia.v4.J2, ButiaComparison.Greater, 20, 1, function () {
    butiaV4.turn(ButiaTurnDirection.Right, 10, 0.5)
    butiaV4.moveForward(20, 0.5)
})
butiaV4.onLight(butia.v4.J1, ButiaComparison.Greater, 20, 1, function () {
    butiaV4.turn(ButiaTurnDirection.Left, 10, 0.5)
    butiaV4.moveForward(20, 0.5)
})
butiaV4.selectMap(ButiaSimMap.Light)
