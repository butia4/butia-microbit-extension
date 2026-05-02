namespace Butia {
    //% fixedInstances
    export class RobotDriver {
        private static _instance: RobotDriver | null = null

        constructor(private readonly _robot: IRobot) {}

        static start(instance: RobotDriver): void {
            if (RobotDriver._instance === instance) return
            if (RobotDriver._instance) control.fail("Ya se inició otro robot")
            RobotDriver._instance = instance
            instance._robot.start()
        }

        static instance(): RobotDriver {
            if (!RobotDriver._instance)
                throw "Debe iniciar un robot con el bloque 'robot ... start'"
            return RobotDriver._instance
        }

        static getCurrentRobot(): IRobot {
            return RobotDriver.instance()._robot
        }
    }
}
