import type { TemperatureRange } from './types';
export function validateRange(range: TemperatureRange): TemperatureRange { if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min >= range.max) throw new Error('Temperature range must have finite min < max'); return range; }
