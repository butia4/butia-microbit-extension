import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act } from "react"
import { createRoot, Root } from "react-dom/client"
import { PinSettings } from "./PinSettings"
import { clearPinAssignment, getPinAssignment } from "../settings/pinAssignmentStore"

const MOUNT_LABELS = [
    "Delantero Izquierdo",
    "Delantero Derecho",
    "Lateral Izquierdo",
    "Lateral Derecho",
    "Trasero Izquierdo",
    "Trasero Derecho",
]

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

    function renderPinSettings(onClose: () => void): { selects: HTMLSelectElement[]; saveButton: HTMLButtonElement } {
        act(() => {
            root = createRoot(container)
            root.render(<PinSettings onClose={onClose} />)
        })
        const selects = Array.from(container.querySelectorAll("select")) as HTMLSelectElement[]
        const saveButton = Array.from(container.querySelectorAll("button")).find(
            (b) => b.textContent === "Guardar"
        ) as HTMLButtonElement
        return { selects, saveButton }
    }

    function changeSelect(select: HTMLSelectElement, value: string): void {
        act(() => {
            select.value = value
            select.dispatchEvent(new Event("change", { bubbles: true }))
        })
    }

    it("renders exactly 6 rows with the correct Spanish labels, in order", () => {
        const { selects } = renderPinSettings(vi.fn())

        expect(selects).toHaveLength(6)
        const labels = Array.from(container.querySelectorAll("label")).map((l) => l.textContent)
        expect(labels).toEqual(MOUNT_LABELS)
    })

    it("defaults every row to \"Sin conector\" (unconfigured) when nothing was persisted", () => {
        const { selects } = renderPinSettings(vi.fn())

        for (const select of selects) {
            expect(select.value).toBe("")
        }
    })

    it("\"Sin conector\" is selectable and persists as key-absence on save", () => {
        const onClose = vi.fn()
        const { selects, saveButton } = renderPinSettings(onClose)

        changeSelect(selects[0], "J1")
        changeSelect(selects[0], "") // back to "Sin conector"
        act(() => {
            saveButton.click()
        })

        expect(getPinAssignment()).toEqual({})
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("save succeeds with 0 configured mounts (all unconfigured)", () => {
        const onClose = vi.fn()
        const { saveButton } = renderPinSettings(onClose)

        act(() => {
            saveButton.click()
        })

        expect(getPinAssignment()).toEqual({})
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("save succeeds with a partial configuration (some rows wired, some \"Sin conector\")", () => {
        const onClose = vi.fn()
        const { selects, saveButton } = renderPinSettings(onClose)

        changeSelect(selects[0], "J1") // frontLeft
        changeSelect(selects[2], "J2") // sideLeft
        act(() => {
            saveButton.click()
        })

        expect(getPinAssignment()).toEqual({ frontLeft: "J1", sideLeft: "J2" })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("save succeeds with 5-of-6 mounts configured to distinct connectors", () => {
        const onClose = vi.fn()
        const { selects, saveButton } = renderPinSettings(onClose)

        changeSelect(selects[0], "J1")
        changeSelect(selects[1], "J2")
        changeSelect(selects[2], "J3")
        changeSelect(selects[3], "J4")
        changeSelect(selects[4], "J5")
        act(() => {
            saveButton.click()
        })

        expect(getPinAssignment()).toEqual({
            frontLeft: "J1", frontRight: "J2", sideLeft: "J3", sideRight: "J4", rearLeft: "J5",
        })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not persist while a connector is only selected, not saved", () => {
        const onClose = vi.fn()
        const { selects } = renderPinSettings(onClose)

        changeSelect(selects[0], "J4")

        expect(getPinAssignment()).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
    })

    it("shows the Spanish duplicate-connector error on Guardar and does not persist or close, but does not flag unconfigured rows as conflicting", () => {
        const onClose = vi.fn()
        const { selects, saveButton } = renderPinSettings(onClose)

        changeSelect(selects[0], "J1") // frontLeft
        changeSelect(selects[1], "J1") // frontRight — duplicate of frontLeft
        act(() => {
            saveButton.click()
        })

        const errorEl = container.querySelector('[role="alert"]')
        expect(errorEl).not.toBeNull()
        expect(errorEl?.textContent).toMatch(/mismo conector/i)
        expect(getPinAssignment()).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
    })
})
