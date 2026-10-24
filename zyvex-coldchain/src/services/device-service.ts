export function validateDeviceId(deviceId: string): string { const clean = deviceId.trim(); if (!/^[A-Za-z0-9._:-]{3,80}$/.test(clean)) throw new Error('Device ID format is invalid'); return clean; }
