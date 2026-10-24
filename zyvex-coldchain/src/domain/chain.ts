export type ChainConfig = { chainId: number; contractAddress?: string; explorerBaseUrl?: string };
export function isValidEvmAddress(value: string): boolean { return /^0x[a-fA-F0-9]{40}$/.test(value); }
export function explorerTransactionUrl(base: string | undefined, hash: string): string | null { return base && /^0x[a-fA-F0-9]{64}$/.test(hash) ? `${base.replace(/\/$/, '')}/tx/${hash}` : null; }
