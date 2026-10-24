import { isValidEvmAddress } from '../domain/chain';
export function validateAnchorRequest(address: string, digest: string) { if (!isValidEvmAddress(address)) throw new Error('Invalid contract address'); if (!/^0x[a-fA-F0-9]{64}$/.test(digest)) throw new Error('Invalid bytes32 digest'); return { address, digest }; }
