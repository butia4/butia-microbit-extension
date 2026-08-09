namespace butia {
    // Builds the JSON error message sent from PXT to the botsim.
    // Exposed as a pure function so tests can verify message structure directly.
    export function buildErrorMessage(code: string): string {
        return JSON.stringify({
            type: "error",
            code: code
        });
    }
}
