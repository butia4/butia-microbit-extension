let distance = 0
butiaV2.selectMap(ButiaSimMap.CircleArena)
basic.forever(function () {
    distance = butiaV2.obstacleDistance(butia.v2.J3)
    if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black) || butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {
        butiaV2.moveBackward(40, 0.1)
        butiaV2.turn(ButiaTurnDirection.Right, 40, 0.1)
    } else if (distance > 0 && distance < 30) {
        butiaV2.moveForward(50)
    } else {
        butiaV2.turn(ButiaTurnDirection.Right, 25)
    }
})
