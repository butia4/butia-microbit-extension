namespace Butia {
    // Set to true to enable datalogger output, false to disable.
    export const _logEnabled = true;

    if (_logEnabled) {
        // datalogger.deleteLog();
        datalogger.includeTimestamp(FlashLogTimeStampFormat.Seconds);
    }

    export function _log(evento: string, datos: string): void {
        if (!_logEnabled) return;
        datalogger.log(
            datalogger.createCV("evento", evento),
            datalogger.createCV("datos", datos)
        );
    }
}
