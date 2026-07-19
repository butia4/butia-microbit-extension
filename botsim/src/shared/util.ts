export function toRadians(degrees: number): number { return (degrees * Math.PI) / 180 }
export function toDegrees(radians: number): number { return (radians * 180) / Math.PI }
export function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)) }

let _idCounter = 0
export function nextId(): string { return `id_${++_idCounter}` }

export function pickRandom<T>(items: T[]): T { return items[Math.floor(Math.random() * items.length)] }
