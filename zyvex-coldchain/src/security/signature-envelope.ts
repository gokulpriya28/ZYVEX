export type SignatureEnvelope = { algorithm: 'HMAC-SHA256' | 'ECDSA-P256-SHA256'; keyId: string; signature: string; signedAt: string };
export function signatureEnvelope(algorithm: SignatureEnvelope['algorithm'], keyId: string, signature: string): SignatureEnvelope { return { algorithm, keyId, signature, signedAt: new Date().toISOString() }; }
