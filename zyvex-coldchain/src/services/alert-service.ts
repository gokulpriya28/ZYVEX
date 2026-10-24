import { evaluateReading } from '../domain/alert-rules';
import type { TemperatureRange } from '../domain/types';
export function createAlertIfNeeded(temperature: number, range: TemperatureRange) { const result = evaluateReading(temperature, range); return result.triggered ? { ...result, temperature, createdAt: new Date().toISOString(), resolved: false } : null; }
