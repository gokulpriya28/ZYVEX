import { describe, expect, it } from 'vitest';
import { canonicalJson } from '../../src/domain/canonicalize';
describe('canonicalJson', () => { it('sorts object keys consistently', () => expect(canonicalJson({ b: 2, a: 1 })).toBe(canonicalJson({ a: 1, b: 2 })); it('preserves array order', () => expect(canonicalJson([2, 1])).not.toBe(canonicalJson([1, 2]))); });
