butiaV4.selectMap(ButiaSimMap.LineAToB)
basic.forever(function () {
    if (butiaV4.graySensorSees(butia.v4.J1, ButiaColor.Black)) {
        butiaV4.motorTank(5, 35)
    } else if (butiaV4.graySensorSees(butia.v4.J2, ButiaColor.Black)) {
        butiaV4.motorTank(35, 5)
    } else {
        butiaV4.motorTank(30, 30)
    }
})
