export type AnchorRecord = { digest: string; txHash: string; blockNumber?: number; network: string };
export function anchorRecordLooksValid(a: AnchorRecord): boolean { return /^0x[a-fA-F0-9]{64}$/.test(a.digest) && /^0x[a-fA-F0-9]{64}$/.test(a.txHash) && a.network.trim().length > 0; }
