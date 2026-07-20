export const ALL_MOUNT_SIDES = ["frontLeft", "frontRight", "sideLeft", "sideRight", "rearLeft", "rearRight"] as const
export type MountSide = (typeof ALL_MOUNT_SIDES)[number]
