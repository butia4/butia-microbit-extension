namespace Butia {
    //% fixedInstances
    export class RobotDriver {
        private static _instance: RobotDriver | null = null;
        private _robot: IRobot;

        constructor(robot: IRobot) {
            this._robot = robot;
        }

        _setSimRobot(robot: IRobot): void {
            this._robot = robot;
        }

        static start(instance: RobotDriver): void {
            if (RobotDriver._instance === instance) return;
            if (RobotDriver._instance) control.fail("Ya se inició otro robot");
            RobotDriver._instance = instance;
            _registerSimRobot(instance);
            instance._robot.start();
        }

        static instance(): RobotDriver {
            if (!RobotDriver._instance)
                RobotDriver.start(Butia4_1_0);
            return RobotDriver._instance as RobotDriver;
        }

        static currentRobot(): IRobot {
            return RobotDriver.instance()._robot;
        }
    }
}
