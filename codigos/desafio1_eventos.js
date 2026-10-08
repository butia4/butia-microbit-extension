butiaV2.selectMap(ButiaSimMap.LineAToB)
// basic.forever(function () {
//     radio.sendValue("Gris", butiaV2.readGraySensor(butia.v2.J1))
// })
butiaV2.selectMap(ButiaSimMap.LineAToB)
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.White, 1, function () {
    butiaV2.moveForward(50)
})
butiaV2.onGraySensorSees(butia.v2.J2, ButiaColor.White, 1, function () {
    butiaV2.moveForward(50)
})
butiaV2.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 2, function () {
    butiaV2.turn(ButiaTurnDirection.Left, 50, 0.3)
})
butiaV2.onGraySensorSees(butia.v2.J2, ButiaColor.Black, 3, function () {
    butiaV2.turn(ButiaTurnDirection.Right, 50, 0.3)
})
