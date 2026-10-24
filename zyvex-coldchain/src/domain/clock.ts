export function isoNow(): string { return new Date().toISOString(); }
export function isRecent(iso: string, withinMs: number, now = Date.now()): boolean { const time = Date.parse(iso); return Number.isFinite(time) && now - time <= withinMs && time <= now + 60_000; }
