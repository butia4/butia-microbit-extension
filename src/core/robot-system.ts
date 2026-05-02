namespace RobotSystem {
    let _registry: IRobotRecord[] = [];
    let _active: IRobotRecord | null = null;
    let _activeRobot: IRobot | null = null;
    let _connectorPins: { connector: Connector; pin: DigitalPin }[] = [];

    let _motorLeftOverride: Connector[] | null = null;
    let _motorRightOverride: Connector[] | null = null;

    export function register(record: IRobotRecord): void {
        _registry.push(record);
    }

    export function configureMotorLeft(c1: Connector, c2: Connector): void {
        _motorLeftOverride = [c1, c2];
    }

    export function configureMotorRight(c1: Connector, c2: Connector): void {
        _motorRightOverride = [c1, c2];
    }

    export function setActive(model: RobotModel): void {
        if (_active && _active.model === model) return;
        if (_active && _active.model !== model) {
            basic.showString("ERR");
            control.fail("Robot ya activo: " + _active.model);
            return;
        }
        for (const r of _registry) {
            if (r.model === model) {
                const cfg: IRobotConfig = {
                    connectorPins: r.defaultConfig.connectorPins,
                    motorLeftConnectors: _motorLeftOverride !== null ? _motorLeftOverride : r.defaultConfig.motorLeftConnectors,
                    motorRightConnectors: _motorRightOverride !== null ? _motorRightOverride : r.defaultConfig.motorRightConnectors,
                };
                _activeRobot = r.build(cfg);
                _connectorPins = cfg.connectorPins;
                _active = r;
                _activeRobot.start();
                return;
            }
        }
        basic.showString("ERR");
        control.fail("RobotModel not registered: " + model);
    }

    export function resolveAnalog(connector: Connector): AnalogPin {
        return resolveDigital(connector) as number as AnalogPin;
    }

    export function resolveDigital(connector: Connector): DigitalPin {
        for (const cp of _connectorPins) {
            if (cp.connector === connector) return cp.pin;
        }
        basic.showString("ERR");
        control.fail("Puerto no configurado: " + connector);
        return 0 as DigitalPin; // unreachable
    }

    export function resolveFromConfig(
        connectorPins: { connector: Connector; pin: DigitalPin }[],
        connector: Connector
    ): DigitalPin {
        for (let i = 0; i < connectorPins.length; i++) {
            if (connectorPins[i].connector === connector) return connectorPins[i].pin;
        }
        basic.showString("ERR");
        control.fail("Puerto no encontrado en config: " + connector);
        return 0 as DigitalPin; // unreachable
    }

    export function activeRobot(): IRobot {
        if (_activeRobot) return _activeRobot;
        basic.showString("ERR");
        control.fail("No active robot. Call RobotSystem.setActive() first.");
        return _registry[0].build(_registry[0].defaultConfig); // unreachable
    }

    export function reset(): void {
        _registry = [];
        _active = null;
        _activeRobot = null;
        _connectorPins = [];
        _motorLeftOverride = null;
        _motorRightOverride = null;
    }
}
