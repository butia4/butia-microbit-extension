let distance = 0
butiaV4.selectMap(ButiaSimMap.CircleArena)
basic.forever(function () {
    distance = butiaV4.obstacleDistance(butia.v4.J3)
    if (butiaV4.graySensorSees(butia.v4.J1, ButiaColor.Black) || butiaV4.graySensorSees(butia.v4.J2, ButiaColor.Black)) {
        butiaV4.moveBackward(40, 0.1)
        butiaV4.turn(ButiaTurnDirection.Right, 40, 0.1)
    } else if (distance > 0 && distance < 30) {
        butiaV4.moveForward(50)
    } else {
        butiaV4.turn(ButiaTurnDirection.Right, 25)
    }
})
