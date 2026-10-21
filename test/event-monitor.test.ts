// Event system tests. Drives the EventMonitor synchronously via
// _stepEventMonitor() (which returns the subId fired this cycle), so
// assertions don't depend on the PXT event scheduler.
// Mocks come from test/_mocks.ts.

const eCfg: butia.ConnectorChannels[] = [
    new butia.ConnectorChannels(butia.v2.J1, butia.gpioAnalog(AnalogPin.P1), butia.gpioDigital(DigitalPin.P1)),
    new butia.ConnectorChannels(butia.v2.J2, butia.gpioAnalog(AnalogPin.P2), butia.gpioDigital(DigitalPin.P2)),
];

let s: number;
let sFirst: number;
let sSecond: number;

// --- computeSubId determinism ---

const sA = butia.computeSubId(butia.sensorTypeLight, AnalogPin.P1, butia.dirGreaterOrPressed);
const sB = butia.computeSubId(butia.sensorTypeLight, AnalogPin.P1, butia.dirGreaterOrPressed);
assertTest(sA === sB, "computeSubId deterministic");
assertTest(sA !== butia.computeSubId(butia.sensorTypeLight, AnalogPin.P1, butia.dirLessOrReleased), "subId by direction");
assertTest(sA !== butia.computeSubId(butia.sensorTypeGray, AnalogPin.P1, butia.dirGreaterOrPressed), "subId by sensor type");
assertTest(sA !== butia.computeSubId(butia.sensorTypeLight, AnalogPin.P2, butia.dirGreaterOrPressed), "subId by pin");

// --- onDistance Less: level-triggered + invalid-reading guard ---

const rD = new MockRobot(new MockMotorDriver(), eCfg);
const sD = new MockSensor(50);
rD.mockDistance(AnalogPin.P1, sD);
rD.onDistance(butia.v2.J1, ButiaComparison.Less, 20, 1, () => { });

s = rD._stepEventMonitor();
assertTest(s === 0, "onDistance Less: above threshold no-fire");
sD.setValue(10);
s = rD._stepEventMonitor();
assertTest(s !== 0, "onDistance Less: below threshold fires");
s = rD._stepEventMonitor();
assertTest(s !== 0, "onDistance Less: fires again while condition holds");
sD.setValue(50);
s = rD._stepEventMonitor();
assertTest(s === 0, "onDistance Less: stops once condition no longer holds");
sD.setValue(0);
s = rD._stepEventMonitor();
assertTest(s === 0, "onDistance Less: zero reading ignored");
sD.setValue(-5);
s = rD._stepEventMonitor();
assertTest(s === 0, "onDistance Less: negative reading ignored");

// --- onLight: Greater and Less ---

const rL = new MockRobot(new MockMotorDriver(), eCfg);
const sL1 = new MockSensor(30);
const sL2 = new MockSensor(80);
rL.mockLight(AnalogPin.P1, sL1);
rL.mockLight(AnalogPin.P2, sL2);
rL.onLight(butia.v2.J1, ButiaComparison.Greater, 70, 1, () => { });
rL.onLight(butia.v2.J2, ButiaComparison.Less, 30, 1, () => { });

const subL1 = butia.computeSubId(butia.sensorTypeLight, AnalogPin.P1, butia.dirGreaterOrPressed);
const subL2 = butia.computeSubId(butia.sensorTypeLight, AnalogPin.P2, butia.dirLessOrReleased);

s = rL._stepEventMonitor();
assertTest(s === 0, "onLight: neither fires initially");
sL1.setValue(85);
s = rL._stepEventMonitor();
assertTest(s === subL1, "onLight: Greater fires");
sL1.setValue(30); sL2.setValue(10);
s = rL._stepEventMonitor();
assertTest(s === subL2, "onLight: Less fires");
// Both hold at the same priority: the one registered last wins every cycle.
sL1.setValue(85);
sFirst = rL._stepEventMonitor();
sSecond = rL._stepEventMonitor();
assertTest(sFirst === subL2 && sSecond === subL2, "onLight: equal priority tie goes to last registered");

// --- onGray Greater ---

const rG = new MockRobot(new MockMotorDriver(), eCfg);
const sG = new MockSensor(20);
rG.mockGray(AnalogPin.P1, sG);
rG.onGray(butia.v2.J1, ButiaComparison.Greater, 50, 1, () => { });
s = rG._stepEventMonitor();
assertTest(s === 0, "onGray Greater: below no-fire");
sG.setValue(75);
s = rG._stepEventMonitor();
assertTest(s !== 0, "onGray Greater: fires");

// --- evalComparison: >= and <= fire at boundary equality ---

assertTest(
    butia.evalComparison(ButiaComparison.GreaterOrEqual, 70, 70) &&
    butia.evalComparison(ButiaComparison.LessOrEqual, 30, 30),
    "GE/LE boundary"
);

// --- onConnectorButton: Pressed and Released ---

const rB = new MockRobot(new MockMotorDriver(), eCfg);
const sB1 = new MockSensor(0);
const sB2 = new MockSensor(1);
rB.mockButton(AnalogPin.P1, sB1);
rB.mockButton(AnalogPin.P2, sB2);
rB.onConnectorButton(butia.v2.J1, ButiaButtonState.Pressed, 1, () => { });
rB.onConnectorButton(butia.v2.J2, ButiaButtonState.Released, 1, () => { });

const subB1 = butia.computeSubId(butia.sensorTypeButton, DigitalPin.P1, butia.dirGreaterOrPressed);
const subB2 = butia.computeSubId(butia.sensorTypeButton, DigitalPin.P2, butia.dirLessOrReleased);

s = rB._stepEventMonitor();
assertTest(s === 0, "onConnectorButton: initial no-fire");
sB1.setValue(1);
s = rB._stepEventMonitor();
assertTest(s === subB1, "onConnectorButton: pressed fires");
s = rB._stepEventMonitor();
assertTest(s === subB1, "onConnectorButton: pressed fires again while held");
sB1.setValue(0); sB2.setValue(0);
s = rB._stepEventMonitor();
assertTest(s === subB2, "onConnectorButton: released fires");
sB2.setValue(1);
s = rB._stepEventMonitor();
assertTest(s === 0, "onConnectorButton: no fire once neither condition holds");

// --- priority: highest wins regardless of registration order ---

const rP = new MockRobot(new MockMotorDriver(), eCfg);
const sP1 = new MockSensor(80);
const sP2 = new MockSensor(80);
rP.mockGray(AnalogPin.P1, sP1);
rP.mockGray(AnalogPin.P2, sP2);
rP.onGray(butia.v2.J1, ButiaComparison.Greater, 50, 2, () => { });
rP.onGray(butia.v2.J2, ButiaComparison.Greater, 50, 1, () => { });
const subP1 = butia.computeSubId(butia.sensorTypeGray, AnalogPin.P1, butia.dirGreaterOrPressed);
const subP2 = butia.computeSubId(butia.sensorTypeGray, AnalogPin.P2, butia.dirGreaterOrPressed);

s = rP._stepEventMonitor();
assertTest(s === subP1, "priority: higher priority wins over later registration");
sP1.setValue(20);
s = rP._stepEventMonitor();
assertTest(s === subP2, "priority: lower priority runs when higher no longer holds");

// --- handler exception resets _eventRaising ---

const rE = new MockRobot(new MockMotorDriver(), eCfg);
const sE = new MockSensor(50);
rE.mockDistance(AnalogPin.P1, sE);
let throwNext = true;
rE.onDistance(butia.v2.J1, ButiaComparison.Less, 20, 1, () => {
    if (throwNext) {
        throwNext = false;
        throw "handler-exception";
    }
});

sE.setValue(10);
let threw = false;
try {
    rE._stepEventMonitor();
} catch (e) {
    threw = true;
}
assertTest(threw, "handler throws as expected");

// If _eventRaising were stuck, pollOnce would return 0 here.
s = rE._stepEventMonitor();
assertTest(s !== 0, "_eventRaising reset after handler exception");

basic.showString("ALL PASS events");
