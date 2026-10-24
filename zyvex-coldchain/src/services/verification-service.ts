import { sha256Hex } from '../security/digest';
export async function verifyCanonicalPayload(payload: string, expectedHash: string) { const actualHash = await sha256Hex(payload); return { actualHash, hashMatches: actualHash.toLowerCase() === expectedHash.toLowerCase() }; }
