butiaV4.selectMap(ButiaSimMap.LineAToB)
butiaV4.onGraySensorSees(butia.v4.J1, ButiaColor.White, 1, function () {
    butiaV4.moveForward(30)
})
butiaV4.onGraySensorSees(butia.v4.J2, ButiaColor.White, 1, function () {
    butiaV4.moveForward(30)
})
butiaV4.onGraySensorSees(butia.v4.J1, ButiaColor.Black, 2, function () {
    butiaV4.turn(ButiaTurnDirection.Left, 10)
})
butiaV4.onGraySensorSees(butia.v4.J2, ButiaColor.Black, 2, function () {
    butiaV4.turn(ButiaTurnDirection.Right, 10)
})
