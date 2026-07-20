import { z } from "zod"
import { ALL_MOUNT_SIDES, MountSide } from "../../../botSpecs/botSpec"
import { connectorSlotSchema, PinAssignment } from "./pinAssignment.model"
import { sensorModeSchema } from "../../../botSpecs/sensorSettings.model"
import { hasDuplicateConnector } from "../utils/pin"
import { ANGLE_MAX, ANGLE_MIN, DIRECTION_MAX, DIRECTION_MIN, RANGE_MAX, RANGE_MIN } from "../constants"

// Combined per-mount shape: connector (from pinAssignment) + mode/angle/
// direction/range (from sensorSettings), unified into one RHF-friendly
// schema. Unlike the persisted schemas, angle/direction/range are required
// numbers here — the form always keeps every mount's inputs populated (even
// while hidden), so toDefaultFormValues must supply DEFAULT_ANGLE/
// DEFAULT_DIRECTION/DEFAULT_RANGE for unconfigured/surface mounts. Bounds
// mirror ANGLE_MIN/MAX, DIRECTION_MIN/MAX and RANGE_MIN/MAX (also enforced
// live by SensorMountRow's BarNumberField) so a submit can't smuggle in an
// out-of-range value some other way (e.g. a future non-slider input, or
// programmatic setValue).
export const pinSettingsMountSchema = z
    .object({
        connector: connectorSlotSchema.or(z.literal("")),
        mode: sensorModeSchema,
        angle: z.number().min(ANGLE_MIN).max(ANGLE_MAX),
        direction: z.number().min(DIRECTION_MIN).max(DIRECTION_MAX),
        range: z.number().min(RANGE_MIN).max(RANGE_MAX),
    })
    .strict()

// Built by iterating ALL_MOUNT_SIDES rather than hand-typing each of the 6
// mount keys twice.
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
