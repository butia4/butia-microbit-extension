import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { ALL_MOUNT_SIDES } from "../../../botSpecs/botSpec"
import { PinAssignment } from "../model/pinAssignment.model"
import { pinSettingsFormSchema, PinSettingsFormValues } from "../model/pinSettingsForm.model"
import { SensorMountSetting, SensorSettings } from "../../../botSpecs/sensorSettings.model"
import { RootState } from "../../../redux/store"
import { setPinAssignment } from "../state/pinAssignment.slice"
import { setSensorSettings } from "../state/sensorSettings.slice"
import { toDefaultFormValues } from "../utils/geometry"

export type UsePinSettingsFormResult = {
    form: UseFormReturn<PinSettingsFormValues>
    errorMessage: string | null
    onSubmit: () => void
    onCancel: () => void
}

// Splits the combined, validated form values back into the two persisted
// shapes — mirrors the pre-refactor handleSave: a mount only carries
// "forward" angle/direction into SensorSettings when it's both connected
// and explicitly in "forward" mode, otherwise it's persisted as "surface".
function splitFormValues(values: PinSettingsFormValues): { assignment: PinAssignment; sensorSettings: SensorSettings } {
    const assignment: PinAssignment = {}
    const sensorSettings: SensorSettings = {}
    for (const side of ALL_MOUNT_SIDES) {
        const mount = values.mounts[side]
        if (mount.connector !== "") assignment[side] = mount.connector

        const setting: SensorMountSetting = mount.connector !== "" && mount.mode === "forward"
            ? { mode: "forward", angle: mount.angle, direction: mount.direction, range: mount.range }
            : { mode: "surface" }
        sensorSettings[side] = setting
    }
    return { assignment, sensorSettings }
}

export function usePinSettingsForm(onClose: () => void): UsePinSettingsFormResult {
    const dispatch = useDispatch()
    const initialAssignment = useSelector((state: RootState) => state.pinAssignment)
    const initialSensorSettings = useSelector((state: RootState) => state.sensorSettings)

    const form = useForm<PinSettingsFormValues>({
        mode: "onBlur",
        resolver: zodResolver(pinSettingsFormSchema),
        defaultValues: toDefaultFormValues(initialAssignment, initialSensorSettings),
    })

    const errorMessage = form.formState.errors.mounts?.message ?? null

    const onSubmit = form.handleSubmit((values) => {
        const { assignment, sensorSettings } = splitFormValues(values)
        dispatch(setPinAssignment(assignment))
        dispatch(setSensorSettings(sensorSettings))
        onClose()
    })

    // Discards any unsaved local changes and returns to the sim screen.
    // Safe as a no-op reset: onClose() re-reads pin/sensor settings from
    // their persisted stores (see App.tsx's rearmOnSettingsClose), never
    // from this form's local state, so nothing unsaved here leaks out.
    const onCancel = (): void => {
        onClose()
    }

    return { form, errorMessage, onSubmit, onCancel }
}
