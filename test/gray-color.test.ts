// Gray color preset tests: "sees black/white" reuses the gray sensor comparison.
// Mocks come from test/_mocks.ts; events are stepped synchronously.

const gCfg: butia.ConnectorChannels[] = [
    new butia.ConnectorChannels(butia.v2.J1, butia.gpioAnalog(AnalogPin.P1), butia.gpioDigital(DigitalPin.P1)),
    new butia.ConnectorChannels(butia.v2.J2, butia.gpioAnalog(AnalogPin.P2), butia.gpioDigital(DigitalPin.P2)),
];

// --- grayColorToComparison ---
assertTest(butia.grayColorToComparison(ButiaColor.Black) === ButiaComparison.GreaterOrEqual, "gray: black is >=");
assertTest(butia.grayColorToComparison(ButiaColor.White) === ButiaComparison.Less, "gray: white is <");

// --- graySensorSees boolean, including the threshold boundary ---
const g_rQ = new MockRobot(new MockMotorDriver(), gCfg);
const g_sQ = new MockSensor(80);
g_rQ.mockGray(AnalogPin.P1, g_sQ);
assertTest(g_rQ.graySensorSees(butia.v2.J1, ButiaColor.Black), "graySensorSees: 80 is black");
assertTest(!g_rQ.graySensorSees(butia.v2.J1, ButiaColor.White), "graySensorSees: 80 is not white");
g_sQ.setValue(butia.grayBlackThreshold);
assertTest(g_rQ.graySensorSees(butia.v2.J1, ButiaColor.Black), "graySensorSees: threshold is black");
g_sQ.setValue(10);
assertTest(g_rQ.graySensorSees(butia.v2.J1, ButiaColor.White), "graySensorSees: 10 is white");
assertTest(!g_rQ.graySensorSees(butia.v2.J1, ButiaColor.Black), "graySensorSees: 10 is not black");

// --- onGraySensorSees fires like onGray with the mapped comparison ---
const g_rE = new MockRobot(new MockMotorDriver(), gCfg);
const g_sE = new MockSensor(10);
g_rE.mockGray(AnalogPin.P1, g_sE);
g_rE.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { });
assertTest(g_rE._stepEventMonitor() === 0, "onGraySensorSees: white floor no fire");
g_sE.setValue(90);
assertTest(
    g_rE._stepEventMonitor() === butia.computeSubId(butia.sensorTypeGray, AnalogPin.P1, butia.comparisonToDir(ButiaComparison.GreaterOrEqual)),
    "onGraySensorSees: black fires as gray >= event"
);

// --- priority is respected: higher priority wins when both match ---
const g_rP = new MockRobot(new MockMotorDriver(), gCfg);
g_rP.mockGray(AnalogPin.P1, new MockSensor(90));
g_rP.mockGray(AnalogPin.P2, new MockSensor(10));
let g_low = 0;
let g_high = 0;
g_rP.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { g_low++; });
g_rP.onGraySensorSees(butia.v2.J2, ButiaColor.White, 3, () => { g_high++; });
g_rP._stepEventMonitor();
assertTest(g_high === 1 && g_low === 0, "onGraySensorSees: higher priority wins");

basic.showString("ALL PASS gray-color");
