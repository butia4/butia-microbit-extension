butia.onDistance(butia.J2, ButiaComparison.Less, 20, 1, function () {
    butia.moveBackward(20)
})
butia.onDistance(butia.J1, ButiaComparison.Greater, 20, 2, function () {
    butia.moveForward(20, 1)
    butia.turn(ButiaTurnDirection.Right, 12, 1)
})
butia.onDistance(butia.J2, ButiaComparison.Greater, 20, 2, function () {
    butia.moveForward(20, 1)
    butia.turn(ButiaTurnDirection.Left, 12, 1)
})
butia.onDistance(butia.J1, ButiaComparison.Less, 20, 1, function () {
    butia.moveBackward(20)
})
butia.setMap(ButiaSimMap.Table)
