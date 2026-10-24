import { isExcursion } from './temperature';
import type { TemperatureRange, AlertSeverity } from './types';
export function evaluateReading(value: number, range: TemperatureRange): { triggered: boolean; severity: AlertSeverity; message: string } {
 if (isExcursion(value, range)) return { triggered: true, severity: 'critical', message: `Temperature ${value.toFixed(1)}°C is outside the configured ${range.min}–${range.max}°C range.` };
 return { triggered: false, severity: 'info', message: 'Temperature is within the configured range.' };
}
