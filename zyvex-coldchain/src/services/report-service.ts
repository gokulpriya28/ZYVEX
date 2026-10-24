import { buildAuditReport } from '../domain/audit';
export function createShipmentReport(shipment: unknown, readings: unknown[], alerts: unknown[], anchors: unknown[]) { return buildAuditReport({ shipment, readings, alerts, anchors }); }
