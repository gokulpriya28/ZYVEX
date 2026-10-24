import { describe, expect, it } from 'vitest';
import { isExcursion, validateTemperature } from '../../src/domain/temperature';
describe('temperature rules', () => { it('accepts finite temperatures', () => expect(() => validateTemperature(4.2)).not.toThrow()); it('rejects non-numeric temperatures', () => expect(() => validateTemperature('4')).toThrow()); it('detects high excursion', () => expect(isExcursion(9, { min: 2, max: 8 })).toBe(true)); it('accepts boundary values', () => expect(isExcursion(8, { min: 2, max: 8 })).toBe(false)); });
