import { useEffect, useState } from "react"
import { FULLSCREEN_SIM_MIN_HEIGHT_SCREEN_RATIO } from "../constants"

function checkIsFullscreenSim() {
    const heightRatio = window.innerHeight / window.screen.height
    console.log(`[useIsFullscreenSim] height ratio: ${(heightRatio * 100).toFixed(1)}%`)
    return heightRatio >= FULLSCREEN_SIM_MIN_HEIGHT_SCREEN_RATIO
}

// MakeCode never tells extension iframes when its own fullscreen-sim mode is toggled,
// so we infer it from the iframe's own viewport height, which MakeCode resizes when
// fullscreen is entered/exited.
export function useIsFullscreenSim() {
    const [isFullscreenSim, setIsFullscreenSim] = useState(checkIsFullscreenSim)

    useEffect(() => {
        const onResize = () => setIsFullscreenSim(checkIsFullscreenSim())
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    return isFullscreenSim
}
