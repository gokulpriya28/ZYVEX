import { evaluateReading } from '../domain/alert-rules';
import { validateTemperature } from '../domain/temperature';
import type { TemperatureRange } from '../domain/types';
export function prepareReading(input: { temperature: unknown; range: TemperatureRange }) { validateTemperature(input.temperature); return { temperature: input.temperature, alert: evaluateReading(input.temperature, input.range) }; }
