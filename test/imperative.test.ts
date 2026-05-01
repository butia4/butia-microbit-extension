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

ButiaImperative.setAssist(RobotAssist.ObstacleStop, true)
basic.showString("PASS setAssist enable")

ButiaImperative.setAssist(RobotAssist.ObstacleStop, false)
basic.showString("PASS setAssist disable")

basic.showString("ALL PASS imperative")
