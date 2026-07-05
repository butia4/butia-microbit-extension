import { useEffect, useRef } from "react"
import { Simulation } from "../sim"

export function SimContainer() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        Simulation.instance.mountTo(el)
    }, [])

    // Wire mouse drag-and-drop — exactly one body (bot or obstacle) can be
    // grabbed at a time, delegated to Simulation/Physics.
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleMouseDown = (e: MouseEvent): void => {
            if (e.button !== 0) return
            Simulation.instance.mouseDown({ x: e.offsetX, y: e.offsetY })
        }
        const handleMouseMove = (e: MouseEvent): void => {
            Simulation.instance.mouseMove({ x: e.offsetX, y: e.offsetY })
        }
        const handleMouseUp = (e: MouseEvent): void => {
            if (e.button !== 0) return
            Simulation.instance.mouseUp({ x: e.offsetX, y: e.offsetY })
        }

        el.addEventListener("mousedown", handleMouseDown)
        el.addEventListener("mousemove", handleMouseMove)
        el.addEventListener("mouseup", handleMouseUp)
        return () => {
            el.removeEventListener("mousedown", handleMouseDown)
            el.removeEventListener("mousemove", handleMouseMove)
            el.removeEventListener("mouseup", handleMouseUp)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="sim-container"
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        />
    )
}
