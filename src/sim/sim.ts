//% shim=TD_NOOP
function registerSim(): void {
    const simLine = new SimLineSensor()
    const simDist = new SimDistanceSensor()
    robot.setSimDrivers(simLine, simDist)
    control.simmessages.onReceived(SIM_CHANNEL, (buf: Buffer) => {
        const msg = <ButiaSensorsMessage>JSON.parse(buf.toString())
        if (msg && msg.type === SIM_MSG_SENSORS) {
            simLine.setReadings(msg.lineLeft, msg.lineRight)
            simDist.setDistance(msg.distance)
        }
    })
}

//% shim=TD_NOOP
function sendSim(): void {
    const serial = control.deviceSerialNumber()
    const msg = <ButiaSimStateMessage>{
        type: SIM_MSG_STATE,
        id: RUN_ID,
        deviceId: serial,
        motorLeft: robot._motorLeft,
        motorRight: robot._motorRight,
        lineUsed: true, // intentional: Butia always uses both sensors in sim
        sonarUsed: true // intentional: Butia always uses both sensors in sim
    }
    control.simmessages.send(SIM_CHANNEL, Buffer.fromUTF8(JSON.stringify(msg)), false)
}

//% shim=TD_NOOP
function startSendSimLoop(): void {
    control.inBackground(() => {
        while (true) {
            sendSim()
            basic.pause(POLL_INTERVAL_MS)
        }
    })
}
