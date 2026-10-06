// Gray sensor color presets. "Sees black/white" is a simplified view of the
// gray sensor comparison: each color maps to a fixed comparison against a
// single threshold, so the color blocks reuse the regular gray sensor logic.

namespace butia {
    // Gray readings are normalized to 0-100 (higher = darker) on hardware and
    // in the simulator. Readings at or above this value are black.
    export const grayBlackThreshold = 50;

    export function grayColorToComparison(color: ButiaColor): ButiaComparison {
        return color === ButiaColor.Black ? ButiaComparison.GreaterOrEqual : ButiaComparison.Less;
    }
}
