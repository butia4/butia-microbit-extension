// Gray sensor color presets. "Sees black/white" is a simplified view of the
// gray sensor comparison: the color is classified against a per-connector
// config (threshold + polarity), so the color blocks reuse the regular gray
// sensor logic. A reading below 0 (no data) is neither black nor white.

namespace butia {
    export interface GrayColorConfig {
        threshold: number;
        // true: black is at/above the threshold; false: black is below it.
        // A reading equal to the threshold always belongs to the HIGH side.
        blackIsHigh: boolean;
    }

    // PLACEHOLDER values: to be calibrated on real hardware. Independent
    // objects on purpose so each connector can be tuned on its own.
    // Gray sensors are assumed to be wired on J1 and J2.

    // Desafio seguirdor de linea
    // export const grayJ1: GrayColorConfig = { threshold: 0.05, blackIsHigh: false };
    // export const grayJ2: GrayColorConfig = { threshold: 76, blackIsHigh: false };

    // Desafio salir de bloque
    export const grayJ1: GrayColorConfig = { threshold: 0.05, blackIsHigh: false };
    export const grayJ2: GrayColorConfig = { threshold: 76, blackIsHigh: false };

    // Fallback for any other connector (placeholder, same scale as J1/J2).
    export const grayFallback: GrayColorConfig = { threshold: 12, blackIsHigh: false };
    // Simulator: botsim readings are normalized to 0-100, higher = darker.
    export const graySim: GrayColorConfig = { threshold: 50, blackIsHigh: true };

    export function grayConfigFor(connector: IConnector): GrayColorConfig {
        if (connector.name === "J1") return grayJ1;
        if (connector.name === "J2") return grayJ2;
        return grayFallback;
    }

    // Black is the high side iff blackIsHigh; high side is >= threshold, low side is < threshold.
    export function grayColorComparison(color: ButiaColor, cfg: GrayColorConfig): ButiaComparison {
        const highSide = (color === ButiaColor.Black) === cfg.blackIsHigh;
        return highSide ? ButiaComparison.GreaterOrEqual : ButiaComparison.Less;
    }

    export function grayReadingIs(reading: number, color: ButiaColor, cfg: GrayColorConfig): boolean {
        return reading >= 0 && evalComparison(grayColorComparison(color, cfg), reading, cfg.threshold);
    }
}
