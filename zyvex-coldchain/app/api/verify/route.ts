import { NextRequest,NextResponse } from 'next/server';
import { verifyReading } from '@/lib/server-store';
export async function GET(req:NextRequest){const id=req.nextUrl.searchParams.get('id');if(!id)return NextResponse.json({error:'Missing reading id'},{status:400});try{const result=await verifyReading(id);if(!result)return NextResponse.json({error:'Reading not found'},{status:404});return NextResponse.json(result);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Verification failed'},{status:500});}}
