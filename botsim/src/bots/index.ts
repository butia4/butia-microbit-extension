import butiaBotSpec from "./butia"

export const BOTS: Record<number, typeof butiaBotSpec> = {
    [butiaBotSpec.productId]: butiaBotSpec,
}

export const DEFAULT_BOT = butiaBotSpec.productId
