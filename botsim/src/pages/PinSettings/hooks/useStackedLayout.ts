import { useLayoutEffect, useRef, useState } from "react"

export type UseStackedLayoutResult = {
    containerRef: React.RefObject<HTMLDivElement | null>
    firstItemRef: React.RefObject<HTMLDivElement | null>
    secondItemRef: React.RefObject<HTMLDivElement | null>
    isStacked: boolean
}

/**
 * Detects whether two flex-wrap siblings landed on the same line or wrapped
 * onto separate lines, by comparing their offsetTop after layout. Re-checks
 * whenever the container (or either item) resizes.
 */
export function useStackedLayout(): UseStackedLayoutResult {
    const containerRef = useRef<HTMLDivElement>(null)
    const firstItemRef = useRef<HTMLDivElement>(null)
    const secondItemRef = useRef<HTMLDivElement>(null)
    const [isStacked, setIsStacked] = useState(false)

    useLayoutEffect(() => {
        const container = containerRef.current
        const first = firstItemRef.current
        const second = secondItemRef.current
        if (!container || !first || !second) return

        const checkStacked = (): void => {
            setIsStacked(second.offsetTop > first.offsetTop)
        }

        checkStacked()

        const observer = new ResizeObserver(checkStacked)
        observer.observe(container)
        observer.observe(first)
        observer.observe(second)
        return () => observer.disconnect()
    }, [])

    return { containerRef, firstItemRef, secondItemRef, isStacked }
}
