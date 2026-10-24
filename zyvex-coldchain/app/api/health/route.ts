import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '../../../lib/server-store';
export async function GET() { return NextResponse.json({ ok: true, app: 'Zyvex ColdChain Ledger', mode: isSupabaseConfigured ? 'supabase' : 'demo', timestamp: new Date().toISOString() }); }
