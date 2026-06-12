// Type stubs for the MakeCode datalogger extension (micro:bit V2).
// The real implementation is provided by the PXT build system at compile time.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare interface ColumnValue {}
declare const enum FlashLogTimeStampFormat {
    None = 0,
    Seconds = 1,
    Milliseconds = 2,
    Minutes = 3,
    Hours = 4,
    Days = 5,
}

declare namespace datalogger {
    function log(...columns: ColumnValue[]): void;
    function createCV(column: string, value: number | string): ColumnValue;
    function deleteLog(): void;
    function setColumns(columns: string[]): void;
    function includeTimestamp(format: FlashLogTimeStampFormat): void;
}
