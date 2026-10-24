import type { ShipmentStatus } from './types';
const transitions: Record<ShipmentStatus, ShipmentStatus[]> = { created: ['in_transit','exception'], in_transit: ['delivered','exception'], delivered: [], exception: ['in_transit','delivered'] };
export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean { return transitions[from].includes(to); }
export function assertTransition(from: ShipmentStatus, to: ShipmentStatus): void { if (!canTransition(from,to)) throw new Error(`Invalid shipment transition: ${from} -> ${to}`); }
