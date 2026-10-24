export function sortNewestFirst<T extends { recorded_at: string }>(items: T[]): T[] { return [...items].sort((a,b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at)); }
