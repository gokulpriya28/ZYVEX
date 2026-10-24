import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in first.' },
        { status: 401 },
      );
    }

    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ shipments: shipments ?? [] });
  } catch (error) {
    console.error('Shipment list error:', error);
    return NextResponse.json(
      { error: 'Could not load shipments.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in first.' },
        { status: 401 },
      );
    }

    // Do not trust user-editable metadata for role authorization.
    // Until a trusted server-managed role system is configured,
    // shipment creation is intentionally disabled.
    return NextResponse.json(
      {
        error:
          'Your account must be assigned the manufacturer role by an administrator before creating shipments.',
      },
      { status: 403 },
    );
  } catch (error) {
    console.error('Shipment creation error:', error);
    return NextResponse.json(
      { error: 'Could not process shipment request.' },
      { status: 500 },
    );
  }
}