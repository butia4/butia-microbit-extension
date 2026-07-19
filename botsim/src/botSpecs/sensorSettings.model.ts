import { z } from "zod"

export const sensorModeSchema = z.enum(["forward", "surface"])

export const sensorMountSettingSchema = z
    .object({
        mode: sensorModeSchema,
        angle: z.number().optional(),
        direction: z.number().optional(),
    })
    .strict()

// A mount absent from the object is "unconfigured" (defaults to "surface").
export const sensorSettingsSchema = z
    .object({
        frontLeft: sensorMountSettingSchema.optional(),
        frontRight: sensorMountSettingSchema.optional(),
        sideLeft: sensorMountSettingSchema.optional(),
        sideRight: sensorMountSettingSchema.optional(),
        rearLeft: sensorMountSettingSchema.optional(),
        rearRight: sensorMountSettingSchema.optional(),
    })
    .strict()

export type SensorMode = z.infer<typeof sensorModeSchema>
export type SensorMountSetting = z.infer<typeof sensorMountSettingSchema>
export type SensorSettings = z.infer<typeof sensorSettingsSchema>

export const DEFAULT_SENSOR_SETTINGS: SensorSettings = {}
