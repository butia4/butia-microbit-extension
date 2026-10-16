butiaV2.selectMap(ButiaSimMap.LineAToB)
basic.forever(function () {
    if (butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {

    } else if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black)) {

    } else {

    }
})
