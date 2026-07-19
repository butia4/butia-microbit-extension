// Wire-level slot naming (J1-J5) a student's `Butia.setMap()` call wires up.
// Decoupled from MountSide — see mountSide.ts.
export const ALL_CONNECTOR_SLOTS = ["J1", "J2", "J3", "J4", "J5"] as const
export type ConnectorSlot = (typeof ALL_CONNECTOR_SLOTS)[number]
