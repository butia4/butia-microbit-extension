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
            className="butia-screen-transition overflow-hidden rounded-tl-[6%_7%] rounded-tr-[6%_7%] rounded-bl-[7%_6%] rounded-br-[7%_6%] shadow-[inset_0_0_0_3px_var(--butia-green-100),inset_0_2px_12px_rgba(0,0,0,0.15)]"
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        />
    )
}
