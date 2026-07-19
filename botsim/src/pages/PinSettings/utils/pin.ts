import { ConnectorSlot } from "../../../botSpecs/botSpec"

export function hasDuplicateConnector(assignment: Partial<Record<string, ConnectorSlot | undefined>>): boolean {
    const configuredSlots = Object.values(assignment).filter((slot): slot is ConnectorSlot => slot !== undefined)
    return new Set(configuredSlots).size !== configuredSlots.length
}