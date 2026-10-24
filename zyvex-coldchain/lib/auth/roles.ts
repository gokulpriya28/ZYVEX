export const APP_ROLES = [
  'manufacturer',
  'transport',
  'receiver',
  'admin',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  manufacturer: 'Manufacturer / Shipper',
  transport: 'Transport Logistics',
  receiver: 'Hospital / Warehouse Receiver',
  admin: 'System Administrator',
};

export const ROLE_HOME: Record<AppRole, string> = {
  manufacturer: '/shipments',
  transport: '/dashboard',
  receiver: '/deliveries',
  admin: '/admin',
};

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === 'string' &&
    APP_ROLES.includes(value as AppRole)
  );
}