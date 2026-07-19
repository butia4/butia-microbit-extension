import { z } from "zod"
import { ALL_CONNECTOR_SLOTS } from "../../../botSpecs/connectorSlot"
import { hasDuplicateConnector } from "../utils/pin"

export const connectorSlotSchema = z.enum(ALL_CONNECTOR_SLOTS)

export const pinAssignmentSchema = z
    .object({
        frontLeft: connectorSlotSchema.optional(),
        frontRight: connectorSlotSchema.optional(),
        sideLeft: connectorSlotSchema.optional(),
        sideRight: connectorSlotSchema.optional(),
        rearLeft: connectorSlotSchema.optional(),
        rearRight: connectorSlotSchema.optional(),
    })
    .strict()
    .refine((assignment) => !hasDuplicateConnector(assignment), {
        message: "No se puede asignar el mismo conector a más de un montaje.",
    })

export type PinAssignment = z.infer<typeof pinAssignmentSchema>

export const DEFAULT_PIN_ASSIGNMENT: PinAssignment = {}
