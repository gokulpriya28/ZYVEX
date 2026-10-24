export type Reading = {
  id: string;
  timestamp: string;
  temperature: number;
  signature?: string;
};

export type SignedReading = Reading & { signature: string };

export async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function canonicalize(shipmentId: string, readings: Reading[]): string {
  return JSON.stringify({
    schema: 'zyvex-coldchain-v1',
    shipmentId,
    readings: readings.map(({ id, timestamp, temperature }) => ({ id, timestamp, temperature }))
  });
}

function toBase64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export async function createSigningKeys(): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey; publicKeyText: string }> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
  ) as CryptoKeyPair;
  const exported = await crypto.subtle.exportKey('spki', pair.publicKey);
  return { privateKey: pair.privateKey, publicKey: pair.publicKey, publicKeyText: toBase64(exported) };
}

export async function signReading(reading: Reading, privateKey: CryptoKey): Promise<string> {
  const payload = JSON.stringify({ id: reading.id, timestamp: reading.timestamp, temperature: reading.temperature });
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(payload)
  );
  return toBase64(signature);
}

export async function verifyReadingSignature(
  reading: SignedReading,
  publicKey: CryptoKey
): Promise<boolean> {
  const payload = JSON.stringify({
    id: reading.id,
    timestamp: reading.timestamp,
    temperature: reading.temperature,
  });

  const signature = fromBase64(reading.signature);
  const data = new TextEncoder().encode(payload);

  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    signature,
    data
  );
}

export async function importPublicKey(publicKeyText: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('spki', fromBase64(publicKeyText), { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
}

export function makeSampleReadings(): Reading[] {
  const now = Date.now();
  const values = [4.1, 4.3, 4.6, 4.8, 5.2, 9.4, 10.1, 6.3, 4.9];
  return values.map((temperature, index) => ({
    id: `R-${String(index + 1).padStart(3, '0')}`,
    timestamp: new Date(now - (values.length - index - 1) * 15 * 60_000).toISOString(),
    temperature
  }));
}

export function shortHash(hash: string): string {
  return hash.length > 20 ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : hash;
}
