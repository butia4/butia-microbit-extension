let distance = 0
butiaV2.selectMap(ButiaSimMap.CircleArena)
basic.forever(function () {
    distance = butiaV2.obstacleDistance(butia.v2.J2)
    if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black) || butiaV2.graySensorSees(butia.v2.J5, ButiaColor.Black)) {
        butiaV2.moveBackward(60, 0.1)
        butiaV2.turn(ButiaTurnDirection.Right, 60, 0.1)
    } else if (distance > 0 && distance < 50) {
        butiaV2.moveForward(60)
    } else {
        butiaV2.turn(ButiaTurnDirection.Right, 60)
    }
})
