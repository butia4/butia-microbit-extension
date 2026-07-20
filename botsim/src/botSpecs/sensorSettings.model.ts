import { z } from "zod"

export const sensorModeSchema = z.enum(["forward", "surface"])

export const ANGLE_MIN = 30
export const ANGLE_MAX = 90
export const DIRECTION_MIN = -45
export const DIRECTION_MAX = 45

// range (cm) overrides the sensor type's own default max range when set
export const RANGE_MIN = 20
export const RANGE_MAX = 50

export const sensorMountSettingSchema = z
    .object({
        mode: sensorModeSchema,
        angle: z.number().min(ANGLE_MIN).max(ANGLE_MAX).optional(),
        direction: z.number().min(DIRECTION_MIN).max(DIRECTION_MAX).optional(),
        range: z.number().min(RANGE_MIN).max(RANGE_MAX).optional(),
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
