import { NextResponse } from 'next/server';
import { dashboard } from '@/lib/server-store';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(await dashboard());}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to load dashboard'},{status:500});}}
