import type { SupabaseClient } from '@supabase/supabase-js';
export async function listShipments(client: SupabaseClient) { const result = await client.from('shipments').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data ?? []; }
export async function listRecentReadings(client: SupabaseClient, limit = 100) { const result = await client.from('temperature_readings').select('*').order('recorded_at', { ascending: false }).limit(Math.min(Math.max(limit, 1), 500)); if (result.error) throw result.error; return result.data ?? []; }
