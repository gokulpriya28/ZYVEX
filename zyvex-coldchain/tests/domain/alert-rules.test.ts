import { describe, expect, it } from 'vitest';
import { evaluateReading } from '../../src/domain/alert-rules';
describe('alert rules', () => { it('triggers critical alert outside range', () => expect(evaluateReading(9, { min: 2, max: 8 }).severity).toBe('critical')); it('does not trigger inside range', () => expect(evaluateReading(4, { min: 2, max: 8 }).triggered).toBe(false)); });
