butiaV2.selectMap(ButiaSimMap.CircleArena)
basic.forever(function () {
    if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black) || butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {

    } else if (butiaV2.obstacleDistance(butia.v2.J5) > 0 && butiaV2.obstacleDistance(butia.v2.J5) < 70) {

    } else {

    }
})
