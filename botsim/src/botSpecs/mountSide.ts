// The bot's 6 fixed physical sensor mount positions: 2 frontal, 2 lateral, 2 rear.
export const ALL_MOUNT_SIDES = ["frontLeft", "frontRight", "sideLeft", "sideRight", "rearLeft", "rearRight"] as const
export type MountSide = (typeof ALL_MOUNT_SIDES)[number]
