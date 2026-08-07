namespace butia {
    // Set to true to enable datalogger output, false to disable.
    export const _logEnabled = false;

    if (_logEnabled) {
        // datalogger.deleteLog();
        datalogger.includeTimestamp(FlashLogTimeStampFormat.Seconds);
    }

    export function _log(event: string, data: string): void {
        if (!_logEnabled) return;
        datalogger.log(
            datalogger.createCV("evento", event),
            datalogger.createCV("datos", data)
        );
    }
}
