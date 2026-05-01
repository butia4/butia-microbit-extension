namespace Butia {
    //% fixedInstances
    export class RobotDriver {
        private static _instance: RobotDriver | null = null

        constructor(public readonly robot: IRobot) {}

        //% block="Inicializar %this"
        //% blockId=butia_robot_start
        //% weight=100
        //% group="Obligatorio"
        start() {
            if (RobotDriver._instance === this) return
            if (RobotDriver._instance) control.fail("Ya se inició otro robot")
            RobotDriver._instance = this
            this.robot.start()
        }

        static instance(): RobotDriver {
            if (!RobotDriver._instance)
                throw "Debe iniciar un robot con el bloque 'robot ... start'"
            return RobotDriver._instance
        }

        static currentRobot(): IRobot {
            return RobotDriver.instance().robot
        }
    }
}
