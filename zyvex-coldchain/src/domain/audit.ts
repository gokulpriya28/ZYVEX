import { AUDIT_EXPORT_VERSION } from './constants';
export function buildAuditReport(input: { generatedAt?: string; shipment: unknown; readings: unknown[]; alerts: unknown[]; anchors: unknown[] }) {
 return { product: 'Zyvex ColdChain Ledger', schemaVersion: AUDIT_EXPORT_VERSION, generatedAt: input.generatedAt ?? new Date().toISOString(), ...input };
}
