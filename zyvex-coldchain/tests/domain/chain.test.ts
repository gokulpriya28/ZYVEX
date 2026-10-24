import { describe, expect, it } from 'vitest';
import { isValidEvmAddress } from '../../src/domain/chain';
describe('EVM address validation', () => { it('accepts a 20-byte hex address', () => expect(isValidEvmAddress('0x' + 'a'.repeat(40))).toBe(true)); it('rejects malformed address', () => expect(isValidEvmAddress('0x123')).toBe(false)); });
