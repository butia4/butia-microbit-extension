// Gray color preset tests: per-connector config + polarity classification.
// Mocks come from test/_mocks.ts; events are stepped synchronously.

const gCfg: butia.ConnectorChannels[] = [
    new butia.ConnectorChannels(butia.v2.J1, butia.gpioAnalog(AnalogPin.P1), butia.gpioDigital(DigitalPin.P1)),
    new butia.ConnectorChannels(butia.v2.J2, butia.gpioAnalog(AnalogPin.P2), butia.gpioDigital(DigitalPin.P2)),
];
const gLow: butia.GrayColorConfig = { threshold: 12, blackIsHigh: false };
const gHigh: butia.GrayColorConfig = { threshold: 50, blackIsHigh: true };

// --- config selection ---
assertTest(butia.grayConfigFor(butia.v2.J1) === butia.grayJ1, "gray: J1 config");
assertTest(butia.grayConfigFor(butia.v2.J2) === butia.grayJ2, "gray: J2 config");
assertTest(butia.grayConfigFor(butia.v2.J3) === butia.grayFallback, "gray: fallback config");
assertTest(butia.grayJ1 !== butia.grayJ2 && butia.grayJ1 !== butia.grayFallback, "gray: configs are independent");

// --- classifier: polarity, boundary (equal = high side), no data ---
assertTest(butia.grayReadingIs(5, ButiaColor.Black, gLow) && !butia.grayReadingIs(5, ButiaColor.White, gLow), "gray: low-black 5");
assertTest(!butia.grayReadingIs(30, ButiaColor.Black, gLow) && butia.grayReadingIs(30, ButiaColor.White, gLow), "gray: low-black 30");
assertTest(!butia.grayReadingIs(12, ButiaColor.Black, gLow) && butia.grayReadingIs(12, ButiaColor.White, gLow), "gray: low-black boundary is white");
assertTest(butia.grayReadingIs(11, ButiaColor.Black, gLow) && butia.grayReadingIs(13, ButiaColor.White, gLow), "gray: low-black 11/13");
assertTest(butia.grayReadingIs(100, ButiaColor.Black, gHigh) && !butia.grayReadingIs(100, ButiaColor.White, gHigh), "gray: high-black 100");
assertTest(!butia.grayReadingIs(0, ButiaColor.Black, gHigh) && butia.grayReadingIs(0, ButiaColor.White, gHigh), "gray: high-black 0");
assertTest(butia.grayReadingIs(50, ButiaColor.Black, gHigh) && !butia.grayReadingIs(50, ButiaColor.White, gHigh), "gray: high-black boundary is black");
assertTest(butia.grayReadingIs(51, ButiaColor.Black, gHigh) && butia.grayReadingIs(49, ButiaColor.White, gHigh), "gray: high-black 51/49");
assertTest(!butia.grayReadingIs(-1, ButiaColor.Black, gLow) && !butia.grayReadingIs(-1, ButiaColor.White, gLow), "gray: no data low-black");
assertTest(!butia.grayReadingIs(-1, ButiaColor.Black, gHigh) && !butia.grayReadingIs(-1, ButiaColor.White, gHigh), "gray: no data high-black");

// --- hardware path: graySensorSees ---
const g_rQ = new MockRobot(new MockMotorDriver(), gCfg);
const g_sQ = new MockSensor(5);
g_rQ.mockGray(AnalogPin.P1, g_sQ);
assertTest(g_rQ.graySensorSees(butia.v2.J1, ButiaColor.Black), "graySensorSees: 5 is black");
assertTest(!g_rQ.graySensorSees(butia.v2.J1, ButiaColor.White), "graySensorSees: 5 is not white");
g_sQ.setValue(-1);
assertTest(!g_rQ.graySensorSees(butia.v2.J1, ButiaColor.Black) && !g_rQ.graySensorSees(butia.v2.J1, ButiaColor.White), "graySensorSees: no data");

// --- hardware path: onGraySensorSees subId and no-data ---
const g_rE = new MockRobot(new MockMotorDriver(), gCfg);
const g_sE = new MockSensor(90);
g_rE.mockGray(AnalogPin.P1, g_sE);
g_rE.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { });
assertTest(g_rE._stepEventMonitor() === 0, "onGraySensorSees: white floor no fire");
g_sE.setValue(0);
assertTest(
    g_rE._stepEventMonitor() === butia.computeSubId(butia.sensorTypeGray, AnalogPin.P1, butia.comparisonToDir(ButiaComparison.Less)),
    "onGraySensorSees: black fires as gray < event"
);
const g_rN = new MockRobot(new MockMotorDriver(), gCfg);
g_rN.mockGray(AnalogPin.P1, new MockSensor(-1));
g_rN.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { });
g_rN.onGraySensorSees(butia.v2.J1, ButiaColor.White, 1, () => { });
assertTest(g_rN._stepEventMonitor() === 0, "onGraySensorSees: no data never fires");

// --- priority is respected: higher priority wins when both match ---
const g_rP = new MockRobot(new MockMotorDriver(), gCfg);
g_rP.mockGray(AnalogPin.P1, new MockSensor(0));
g_rP.mockGray(AnalogPin.P2, new MockSensor(90));
let g_low = 0;
let g_high = 0;
g_rP.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { g_low++; });
g_rP.onGraySensorSees(butia.v2.J2, ButiaColor.White, 3, () => { g_high++; });
g_rP._stepEventMonitor();
assertTest(g_high === 1 && g_low === 0, "onGraySensorSees: higher priority wins");

// --- simulator path uses graySim on every connector ---
// Synchronous monitor so the real background fiber cannot re-fire the handler.
class GraySimTestRobot extends butia.ButiaSimRobot {
    protected _newEventMonitor(): butia.EventMonitor { return new butia.TestEventMonitor(); }
}
butia.simState.reset();
const g_sim = new GraySimTestRobot(gCfg);
assertTest(g_sim.graySensorSees(butia.v2.J1, ButiaColor.Black) === false, "sim: unset is not black");
assertTest(g_sim.graySensorSees(butia.v2.J1, ButiaColor.White) === false, "sim: unset is not white");
butia.simState.sensorCache["J1"] = 1023;
butia.simState.sensorCache["J2"] = 0;
assertTest(g_sim.graySensorSees(butia.v2.J1, ButiaColor.Black), "sim: 1023 is black");
assertTest(g_sim.graySensorSees(butia.v2.J2, ButiaColor.White), "sim: 0 is white");
let g_simFired = 0;
g_sim.onGraySensorSees(butia.v2.J1, ButiaColor.Black, 1, () => { g_simFired++; });
g_sim._stepEventMonitor();
assertTest(g_simFired === 1, "sim: black event fires");
butia.simState.sensorCache = {};
g_sim._stepEventMonitor();
assertTest(g_simFired === 1, "sim: no data does not fire");
butia.simState.reset();

basic.showString("ALL PASS gray-color");
