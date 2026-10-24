import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Server Supabase environment variables are missing.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Invalid shipment ID.' },
        { status: 400 }
      );
    }

    const supabase = getServerClient();

    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (shipmentError) throw shipmentError;

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found.' },
        { status: 404 }
      );
    }

    const [
      { data: readings, error: readingsError },
      { data: alerts, error: alertsError },
    ] = await Promise.all([
      supabase
        .from('temperature_readings')
        .select('*')
        .eq('shipment_id', id)
        .order('recorded_at', { ascending: false })
        .limit(100),
      supabase
        .from('temperature_alerts')
        .select('*')
        .eq('shipment_id', id)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    if (readingsError) throw readingsError;
    if (alertsError) throw alertsError;

    return NextResponse.json({
      shipment,
      readings: readings ?? [],
      alerts: alerts ?? [],
    });
  } catch (error) {
    console.error('Shipment detail API error:', error);

    return NextResponse.json(
      { error: 'Could not retrieve shipment details from Supabase.' },
      { status: 500 }
    );
  }
}