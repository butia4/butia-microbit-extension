namespace Butia {
    class ButiaV3Builder implements IRobotRecord {
        model: RobotModel;
        defaultConfig: IRobotConfig;

        constructor() {
            this.model = RobotModel.Butia3;
            this.defaultConfig = {
                connectorPins: [
                    { connector: Connector.Port1, pin: DigitalPin.P0 },
                    { connector: Connector.Port2, pin: DigitalPin.P1 },
                    { connector: Connector.Port3, pin: DigitalPin.P2 },
                    { connector: Connector.Port4, pin: DigitalPin.P8 },
                    { connector: Connector.Port5, pin: DigitalPin.P9 },
                    { connector: Connector.Port6, pin: DigitalPin.P11 },
                    { connector: Connector.Port7, pin: DigitalPin.P12 },
                ],
                motorLeftConnectors: [Connector.Port4, Connector.Port5],
                motorRightConnectors: [Connector.Port6, Connector.Port7],
            };
        }

        build(cfg: IRobotConfig): IRobot {
            const motorLeftPins: DigitalPin[] = [];
            for (let i = 0; i < cfg.motorLeftConnectors.length; i++) {
                motorLeftPins.push(RobotSystem.resolveFromConfig(cfg.connectorPins, cfg.motorLeftConnectors[i]));
            }
            const motorRightPins: DigitalPin[] = [];
            for (let i = 0; i < cfg.motorRightConnectors.length; i++) {
                motorRightPins.push(RobotSystem.resolveFromConfig(cfg.connectorPins, cfg.motorRightConnectors[i]));
            }

            const lights: ILightSensor[] = [];
            const grays: IGraySensor[] = [];
            const distances: IDistanceSensor[] = [];
            for (let i = 0; i < cfg.connectorPins.length; i++) {
                const pin = cfg.connectorPins[i].pin;
                lights.push(new LightSensor(pin));
                grays.push(new GraySensor(pin));
                distances.push(new DistanceSensor(pin));
            }

            return new RobotBase(
                new GPIOMotorDriver(motorLeftPins, motorRightPins),
                distances,
                lights,
                grays
            );
        }
    }

    RobotSystem.register(new ButiaV3Builder());
}
