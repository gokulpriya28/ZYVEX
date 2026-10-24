export function canonicalJson(value: unknown): string { return JSON.stringify(sortRecursively(value)); }
function sortRecursively(value: unknown): unknown {
 if (Array.isArray(value)) return value.map(sortRecursively);
 if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k,v]) => [k, sortRecursively(v)]));
 return value;
}
