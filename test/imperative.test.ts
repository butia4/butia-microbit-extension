Butia.moveForward(50)
basic.showString("PASS moveForward")

Butia.moveForward(50, 200)
basic.showString("PASS moveForward duration")

Butia.moveBackward(50)
basic.showString("PASS moveBackward")

Butia.turn(TurnDirection.Left, 40)
basic.showString("PASS turn left")

Butia.turn(TurnDirection.Right, 40)
basic.showString("PASS turn right")

Butia.motorTank(50, -30)
basic.showString("PASS motorTank")

Butia.motorStop()
basic.showString("PASS motorStop")

Butia.setAssist(RobotAssist.ObstacleStop, true)
basic.showString("PASS setAssist enable")

Butia.setAssist(RobotAssist.ObstacleStop, false)
basic.showString("PASS setAssist disable")

basic.showString("ALL PASS imperative")
