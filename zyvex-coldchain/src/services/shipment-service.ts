export function normalizeShipmentCode(code: string): string { return code.trim().toUpperCase().replace(/\s+/g, '-'); }
export function shipmentIsTrackable(status: string): boolean { return ['created', 'in_transit', 'exception'].includes(status); }
