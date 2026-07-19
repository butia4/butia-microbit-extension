import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act } from "react"
import { createRoot, Root } from "react-dom/client"
import { PinSettings } from "./PinSettings"
import { clearPinAssignment, getPinAssignment } from "../settings/pinAssignmentStore"

describe("PinSettings save flow", () => {
    let container: HTMLDivElement
    let root: Root

    beforeEach(() => {
        clearPinAssignment()
        container = document.createElement("div")
        document.body.appendChild(container)
    })

    afterEach(() => {
        act(() => {
            root.unmount()
        })
        container.remove()
    })

    function renderPinSettings(onClose: () => void): { leftSelect: HTMLSelectElement; rightSelect: HTMLSelectElement; saveButton: HTMLButtonElement } {
        act(() => {
            root = createRoot(container)
            root.render(<PinSettings onClose={onClose} />)
        })
        const selects = container.querySelectorAll("select")
        const [leftSelect, rightSelect] = Array.from(selects) as HTMLSelectElement[]
        const saveButton = Array.from(container.querySelectorAll("button")).find(
            (b) => b.textContent === "Guardar"
        ) as HTMLButtonElement
        return { leftSelect, rightSelect, saveButton }
    }

    it("does not persist while a connector is only selected, not saved", () => {
        const onClose = vi.fn()
        const { rightSelect } = renderPinSettings(onClose)

        act(() => {
            rightSelect.value = "J4"
            rightSelect.dispatchEvent(new Event("change", { bubbles: true }))
        })

        expect(getPinAssignment()).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
    })

    it("shows the Spanish duplicate-port error on Guardar and does not persist or close", () => {
        const onClose = vi.fn()
        const { leftSelect, rightSelect, saveButton } = renderPinSettings(onClose)

        act(() => {
            rightSelect.value = leftSelect.value
            rightSelect.dispatchEvent(new Event("change", { bubbles: true }))
        })
        act(() => {
            saveButton.click()
        })

        const errorEl = container.querySelector('[role="alert"]')
        expect(errorEl).not.toBeNull()
        expect(errorEl?.textContent).toMatch(/mismo conector/i)
        expect(getPinAssignment()).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
    })

    it("persists and closes when Guardar is pressed with valid, distinct ports", () => {
        const onClose = vi.fn()
        const { leftSelect, rightSelect, saveButton } = renderPinSettings(onClose)

        act(() => {
            leftSelect.value = "J3"
            leftSelect.dispatchEvent(new Event("change", { bubbles: true }))
        })
        act(() => {
            rightSelect.value = "J4"
            rightSelect.dispatchEvent(new Event("change", { bubbles: true }))
        })
        act(() => {
            saveButton.click()
        })

        expect(getPinAssignment()).toEqual({ left: "J3", right: "J4" })
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
