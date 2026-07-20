import { z } from "zod"

export const sensorModeSchema = z.enum(["forward", "surface"])

// Reasonable bounds for a mount's cone, per product decision: 30-90 degrees
// for angle (narrower or wider makes the beam impractical for a
// forward-facing sensor) and -45..45 for direction (rotation offset added
// onto the mount's fixed facingDeg — anything past that turns the beam away
// from the mount's own side of the chassis). Shared (not
// PinSettings-feature-scoped) because both this persisted schema and the
// PinSettings form schema/UI need the same range — see
// pages/PinSettings/constants.ts, which re-exports these for the settings
// screen's slider/number inputs.
export const ANGLE_MIN = 30
export const ANGLE_MAX = 90
export const DIRECTION_MIN = -45
export const DIRECTION_MAX = 45

// How far (cm) a "forward" mount's sensor reaches — overrides the sensor
// type's own hardcoded maxRange (LightSensor's LIGHT_MAX_RANGE, RangeSensor's
// MAX_RANGE) when set, same pattern as `angle` overriding
// DEFAULT_LIGHT_ANGLE/DEFAULT_RANGE_ANGLE (see sim/bot/index.ts). One shared
// field for both sensor types since a mount's physical range doesn't depend
// on which sensor type the student's block code ends up reading from it.
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
