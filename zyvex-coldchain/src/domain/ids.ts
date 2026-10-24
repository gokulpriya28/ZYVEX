export function makeLocalId(prefix = 'evt'): string { return `${prefix}_${crypto.randomUUID()}`; }
