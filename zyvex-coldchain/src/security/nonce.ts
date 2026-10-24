export function validNonce(nonce: unknown): nonce is string { return typeof nonce === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(nonce); }
