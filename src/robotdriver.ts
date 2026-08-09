namespace butia {
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

        // Delegates to the active robot so sim-side code (see sim-robot.ts) can
        // build model-aware behavior instead of hardcoding one robot's layout.
        _connectorConfig(): IConnectorPin[] {
            return this._robot.connectorConfig();
        }

        _modelId(): string {
            return this._robot.modelId();
        }

        // Test-only: clears the singleton so isolated scenarios (explicit model
        // selection vs. default lazy-start) can be exercised independently.
        // Not annotated as a block — internal to the test suite.
        static _resetForTests(): void {
            RobotDriver._instance = null;
        }

        static start(instance: RobotDriver): void {
            if (RobotDriver._instance === instance) return;
            if (RobotDriver._instance) control.fail("Another robot was already started.");
            RobotDriver._instance = instance;
            _registerSimRobot(instance);
            instance._robot.start();
        }

        static instance(): RobotDriver {
            if (!RobotDriver._instance) {
                // Notifies botsim (no-op on hardware) before halting, so the
                // simulator can show a dedicated error screen instead of the
                // generic "no map selected" placeholder.
                _simSend(buildErrorMessage("robot_not_started"));
                control.fail("Add the \"start robot\" block before using any other Butia block.");
            }
            return RobotDriver._instance as RobotDriver;
        }

        static currentRobot(): IRobot {
            return RobotDriver.instance()._robot;
        }
    }
}
