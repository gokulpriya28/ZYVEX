import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Shipment = {
  id: string;
  shipment_code: string;
  product: string;
  origin: string;
  destination: string;
  status: string;
  min_temp: number;
  max_temp: number;
  latest_temp: number | null;
  last_seen: string | null;
  created_at: string;
};

export type Reading = {
  id: string;
  shipment_id: string;
  temperature: number;
  recorded_at: string;
  device_id: string;
  integrity_hash: string;
  signature: string;
  simulated: boolean;
};

export type Alert = {
  id: string;
  shipment_id: string;
  severity: string;
  message: string;
  temperature: number;
  created_at: string;
  resolved: boolean;
};

type Store = {
  shipments: Shipment[];
  readings: Reading[];
  alerts: Alert[];
};

function secret(): string {
  const value = process.env.HMAC_SECRET;
  if (!value || value.length < 32) {
    throw new Error('HMAC_SECRET is missing or too short. Check your server environment.');
  }
  return value;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  url && key && url.startsWith('https://')
);

let supabase: SupabaseClient | undefined;

function db(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the server.'
    );
  }

  if (!supabase) {
    supabase = createClient(url!, key!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabase;
}

export async function dashboard(): Promise<Store & { mode: 'supabase' }> {
  const client = db();

  const [s, r, a] = await Promise.all([
    client.from('shipments').select('*').order('created_at', { ascending: false }),
    client.from('temperature_readings').select('*').order('recorded_at', { ascending: false }).limit(100),
    client.from('temperature_alerts').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  if (s.error) throw new Error(`Failed to load shipments: ${s.error.message}`);
  if (r.error) throw new Error(`Failed to load readings: ${r.error.message}`);
  if (a.error) throw new Error(`Failed to load alerts: ${a.error.message}`);

  return {
    mode: 'supabase',
    shipments: (s.data ?? []) as Shipment[],
    readings: (r.data ?? []) as Reading[],
    alerts: (a.data ?? []) as Alert[],
  };
}

export async function addReading(input: {
  shipment_id: string;
  temperature: number;
  device_id: string;
  simulated: boolean;
}) {
  if (!Number.isFinite(input.temperature)) {
    throw new Error('Temperature must be a valid number.');
  }

  const all = await dashboard();
  const shipment = all.shipments.find(s => s.id === input.shipment_id);

  if (!shipment) throw new Error('Shipment not found');

  const recorded_at = new Date().toISOString();
  const payload = JSON.stringify({
    shipment_id: shipment.id,
    temperature: input.temperature,
    recorded_at,
    device_id: input.device_id,
  });

  const integrity_hash = createHash('sha256').update(payload).digest('hex');
  const signature = createHmac('sha256', secret()).update(payload).digest('hex');

  const reading: Reading = {
    id: globalThis.crypto.randomUUID(),
    shipment_id: shipment.id,
    temperature: input.temperature,
    recorded_at,
    device_id: input.device_id,
    integrity_hash,
    signature,
    simulated: input.simulated,
  };

  const client = db();

  const { error: readingError } = await client
    .from('temperature_readings')
    .insert(reading);

  if (readingError) throw new Error(`Failed to save reading: ${readingError.message}`);

  const { error: updateError } = await client
    .from('shipments')
    .update({
      latest_temp: input.temperature,
      last_seen: recorded_at,
    })
    .eq('id', shipment.id);

  if (updateError) throw new Error(`Reading saved, but shipment update failed: ${updateError.message}`);

  if (input.temperature < shipment.min_temp || input.temperature > shipment.max_temp) {
    const alert: Alert = {
      id: globalThis.crypto.randomUUID(),
      shipment_id: shipment.id,
      severity: 'critical',
      message: `Temperature ${input.temperature.toFixed(1)}°C outside ${shipment.min_temp}–${shipment.max_temp}°C range`,
      temperature: input.temperature,
      created_at: recorded_at,
      resolved: false,
    };

    const { error: alertError } = await client
      .from('temperature_alerts')
      .insert(alert);

    if (alertError) throw new Error(`Reading saved, but alert creation failed: ${alertError.message}`);
  }

  return reading;
}

export async function verifyReading(id: string) {
  const all = await dashboard();
  const reading = all.readings.find(r => r.id === id);

  if (!reading) return null;

  const payload = JSON.stringify({
    shipment_id: reading.shipment_id,
    temperature: Number(reading.temperature),
    recorded_at: new Date(reading.recorded_at).toISOString(),
    device_id: reading.device_id,
  });

  const hash = createHash('sha256').update(payload).digest('hex');
  const signature = createHmac('sha256', secret()).update(payload).digest('hex');
  const expected = Buffer.from(signature, 'hex');
  const actual = Buffer.from(reading.signature, 'hex');

  return {
    reading,
    hashMatches: hash === reading.integrity_hash,
    signatureValid:
      expected.length === actual.length &&
      timingSafeEqual(expected, actual),
  };
}