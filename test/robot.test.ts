// Tests for RobotSystem singleton lifecycle.

class RobotTestBuilder implements IRobotRecord {
    model: RobotModel;
    defaultConfig: IRobotConfig;

    constructor() {
        this.model = RobotModel.Butia4;
        this.defaultConfig = {
            connectorPins: [] as { connector: Connector; pin: DigitalPin }[],
            motorLeftConnectors: [] as Connector[],
            motorRightConnectors: [] as Connector[],
        };
    }

    build(_cfg: IRobotConfig): IRobot {
        return new Butia.RobotBase(new MockMotorDriver(), [], [], []);
    }
}

RobotSystem.reset();
RobotSystem.register(new RobotTestBuilder());

RobotSystem.setActive(RobotModel.Butia4);
RobotSystem.setActive(RobotModel.Butia4); // second call with same model must be no-op

RobotSystem.activeRobot(); // must return without throwing
basic.showString("PASS singleton");

basic.showString("ALL PASS robot");
