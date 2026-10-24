export type TemperatureUnit = 'C';
export type ShipmentStatus = 'created' | 'in_transit' | 'delivered' | 'exception';
export type TemperatureReading = { id: string; shipmentId: string; temperature: number; recordedAt: string; deviceId: string; simulated: boolean; digest: string; signature: string };
export type TemperatureRange = { min: number; max: number };
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AuditEvent = { id: string; type: string; actor: string; timestamp: string; details: Record<string, unknown> };
export type VerificationResult = { valid: boolean; hashMatches: boolean; signatureValid: boolean; message: string };
