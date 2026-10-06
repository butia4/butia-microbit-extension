butiaV2.selectMap(ButiaSimMap.LineAToB)
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.White, 1, function () {
    butiaV2.moveForward(30)
})
butiaV2.onGraySensorSees(butia.v2.J2, ButiaColor.White, 1, function () {
    butiaV2.moveForward(30)
})
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 2, function () {
    butiaV2.turn(ButiaTurnDirection.Left, 10)
})
butiaV2.onGraySensorSees(butia.v2.J2, ButiaColor.Black, 2, function () {
    butiaV2.turn(ButiaTurnDirection.Right, 10)
})
