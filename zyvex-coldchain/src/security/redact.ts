const SECRET_KEYS = /key|secret|token|password|authorization|service.role/i;
export function redactSecrets(input: Record<string, unknown>): Record<string, unknown> { return Object.fromEntries(Object.entries(input).map(([k,v]) => [k, SECRET_KEYS.test(k) ? '[REDACTED]' : v])); }
