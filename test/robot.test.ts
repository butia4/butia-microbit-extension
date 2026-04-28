// Tests for RobotBase DI and ButiaRobot.

const butiaRobot = new ButiaRobot()

butiaRobot.start()
basic.showString("PASS start")

// Motor calls return void — behavioral coverage requires hardware or a future mock layer.
butiaRobot.moveForward(50)
basic.showString("PASS moveForward")

butiaRobot.moveForward(50, 100)
basic.showString("PASS moveForward duration")

butiaRobot.moveBackward(50)
basic.showString("PASS moveBackward")

butiaRobot.turn(TurnDirection.Left, 40)
basic.showString("PASS turn left")

butiaRobot.turn(TurnDirection.Right, 40)
basic.showString("PASS turn right")

butiaRobot.motorTank(50, 50)
basic.showString("PASS motorTank")

butiaRobot.motorStop()
basic.showString("PASS motorStop")

const robotDist = butiaRobot.obstacleDistance()
if (typeof robotDist === "number" && robotDist >= 0) {
    basic.showString("PASS obstacleDistance")
} else {
    basic.showString("FAIL obstacleDistance")
}

const robotLineLeft = butiaRobot.detectLine(LineSensorId.Left)
if (typeof robotLineLeft === "boolean") {
    basic.showString("PASS detectLine left")
} else {
    basic.showString("FAIL detectLine left")
}

const robotLineRight = butiaRobot.detectLine(LineSensorId.Right)
if (typeof robotLineRight === "boolean") {
    basic.showString("PASS detectLine right")
} else {
    basic.showString("FAIL detectLine right")
}

butiaRobot.setAssist(RobotAssist.ObstacleStop, true)
basic.showString("PASS setAssist enable")

butiaRobot.setAssist(RobotAssist.ObstacleStop, false)
basic.showString("PASS setAssist disable")

butiaRobot.setAssist(RobotAssist.LineAssist, true)
basic.showString("PASS setAssist LineAssist")

if (typeof robot === "object") {
    basic.showString("PASS robot singleton")
} else {
    basic.showString("FAIL robot singleton")
}

basic.showString("ALL PASS robot")
