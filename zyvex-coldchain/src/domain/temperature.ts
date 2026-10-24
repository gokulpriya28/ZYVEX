import { MAX_READING_C, MIN_READING_C } from './constants';
import type { TemperatureRange } from './types';
export function validateTemperature(value: unknown): asserts value is number {
 if (typeof value !== 'number' || !Number.isFinite(value) || value < MIN_READING_C || value > MAX_READING_C) throw new Error(`Temperature must be a finite number between ${MIN_READING_C}°C and ${MAX_READING_C}°C`);
}
export function isExcursion(value: number, range: TemperatureRange): boolean { return value < range.min || value > range.max; }
export function formatTemperature(value: number): string { return `${value.toFixed(1)}°C`; }
export function describeRange(range: TemperatureRange): string { return `${range.min}°C to ${range.max}°C`; }
