namespace butia {
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
        _connectorConfig(): IConnectorChannels[] {
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
            return RobotDriver._instance as RobotDriver;
        }

        static currentRobot(): IRobot {
            return RobotDriver.instance()._robot;
        }
    }
}
