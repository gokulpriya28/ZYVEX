export function safeCsvCell(value: unknown): string { const s = String(value ?? ''); return /^[=+@\-]/.test(s) ? `'${s}` : s; }
