ButiaImperative.moveForward(50)
basic.showString("PASS moveForward")

ButiaImperative.moveForward(50, 200)
basic.showString("PASS moveForward duration")

ButiaImperative.moveBackward(50)
basic.showString("PASS moveBackward")

ButiaImperative.turn(TurnDirection.Left, 40)
basic.showString("PASS turn left")

ButiaImperative.turn(TurnDirection.Right, 40)
basic.showString("PASS turn right")

ButiaImperative.motorTank(50, -30)
basic.showString("PASS motorTank")

ButiaImperative.motorStop()
basic.showString("PASS motorStop")

const impDist = ButiaImperative.obstacleDistance()
if (typeof impDist === "number") {
    basic.showString("PASS obstacleDistance")
} else {
    basic.showString("FAIL obstacleDistance")
}

const impLineLeft = ButiaImperative.detectLine(LineSensorId.Left)
if (typeof impLineLeft === "boolean") {
    basic.showString("PASS detectLine left")
} else {
    basic.showString("FAIL detectLine left")
}

const impLineRight = ButiaImperative.detectLine(LineSensorId.Right)
if (typeof impLineRight === "boolean") {
    basic.showString("PASS detectLine right")
} else {
    basic.showString("FAIL detectLine right")
}

ButiaImperative.setAssist(RobotAssist.ObstacleStop, true)
basic.showString("PASS setAssist enable")

ButiaImperative.setAssist(RobotAssist.ObstacleStop, false)
basic.showString("PASS setAssist disable")

basic.showString("ALL PASS imperative")
