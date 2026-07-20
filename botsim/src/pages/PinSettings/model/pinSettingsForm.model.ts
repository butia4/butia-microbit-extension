import { z } from "zod"
import { ALL_MOUNT_SIDES, MountSide } from "../../../botSpecs/botSpec"
import { connectorSlotSchema, PinAssignment } from "./pinAssignment.model"
import { sensorModeSchema } from "../../../botSpecs/sensorSettings.model"
import { hasDuplicateConnector } from "../utils/pin"
import { ANGLE_MAX, ANGLE_MIN, DIRECTION_MAX, DIRECTION_MIN, RANGE_MAX, RANGE_MIN } from "../constants"

export const pinSettingsMountSchema = z
    .object({
        connector: connectorSlotSchema.or(z.literal("")),
        mode: sensorModeSchema,
        angle: z.number().min(ANGLE_MIN).max(ANGLE_MAX),
        direction: z.number().min(DIRECTION_MIN).max(DIRECTION_MAX),
        range: z.number().min(RANGE_MIN).max(RANGE_MAX),
    })
    .strict()

const mountsShape = Object.fromEntries(
    ALL_MOUNT_SIDES.map((side) => [side, pinSettingsMountSchema])
) as Record<MountSide, typeof pinSettingsMountSchema>

export const pinSettingsFormSchema = z
    .object({ mounts: z.object(mountsShape).strict() })
    .superRefine((values, ctx) => {
        const assignment: PinAssignment = {}
        for (const side of ALL_MOUNT_SIDES) {
            const connector = values.mounts[side].connector
            if (connector !== "") assignment[side] = connector
        }
        if (hasDuplicateConnector(assignment)) {
            ctx.addIssue({
                code: "custom",
                message: "No se puede asignar el mismo conector a más de un montaje.",
                path: ["mounts"],
            })
        }
    })

export type PinSettingsFormValues = z.infer<typeof pinSettingsFormSchema>
export type PinSettingsMountFormValues = PinSettingsFormValues["mounts"][MountSide]
