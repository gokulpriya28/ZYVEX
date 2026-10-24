import type { Shipment } from '../../lib/server-store';
export function ShipmentSummary({ shipment }: { shipment: Shipment }) { return <article className="shipment-summary"><strong>{shipment.shipment_code}</strong><span>{shipment.product}</span><small>{shipment.origin} → {shipment.destination}</small></article>; }
