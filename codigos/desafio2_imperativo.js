// radio.onReceivedValue(function (name, value) {
//     serial.writeValue(name, value)
// })

butiaV2.selectMap(ButiaSimMap.CircleArena)
radio.setGroup(1)
basic.forever(function () {
    if (butiaV2.graySensorSees(butia.v2.J1, ButiaColor.Black) || butiaV2.graySensorSees(butia.v2.J2, ButiaColor.Black)) {
        butiaV2.moveBackward(60, 0.5)
        butiaV2.turn(ButiaTurnDirection.Right, 60, 1)
    } else if (butiaV2.obstacleDistance(butia.v2.J5) > 0 && butiaV2.obstacleDistance(butia.v2.J5) < 70) {
        butiaV2.moveForward(60)
    } else {
        butiaV2.turn(ButiaTurnDirection.Right, 60)
    }
    // radio.sendValue("Gris", butiaV2.readGraySensor(butia.v2.J2))
})
