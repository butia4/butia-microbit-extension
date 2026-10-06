butiaV4.selectMap(ButiaSimMap.LineAToB)
butiaV4.onGraySensorSees(butia.v4.J1, ButiaColor.White, 1, function () {
    butiaV4.motorTank(30, 30)
})
butiaV4.onGraySensorSees(butia.v4.J2, ButiaColor.White, 1, function () {
    butiaV4.motorTank(30, 30)
})
butiaV4.onGraySensorSees(butia.v4.J1, ButiaColor.Black, 2, function () {
    butiaV4.motorTank(5, 35)
})
butiaV4.onGraySensorSees(butia.v4.J2, ButiaColor.Black, 2, function () {
    butiaV4.motorTank(35, 5)
})
