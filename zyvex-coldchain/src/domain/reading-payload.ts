export type ReadingPayload = { shipment_id: string; temperature: number; recorded_at: string; device_id: string };
export function readingPayload(input: ReadingPayload): ReadingPayload { return { shipment_id: input.shipment_id, temperature: Number(input.temperature), recorded_at: new Date(input.recorded_at).toISOString(), device_id: input.device_id }; }
