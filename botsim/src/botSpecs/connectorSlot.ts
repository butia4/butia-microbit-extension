export const ALL_CONNECTOR_SLOTS = ["J1", "J2", "J3", "J4", "J5", "J6"] as const
export type ConnectorSlot = (typeof ALL_CONNECTOR_SLOTS)[number]
