import { NextRequest,NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function POST(req:NextRequest){
 try{
  const body=await req.json();const batch_hash=String(body.batch_hash||'');const transaction_hash=String(body.transaction_hash||'');const contract_address=String(body.contract_address||'');const chain_id=Number(body.chain_id);
  if(!/^0x[0-9a-fA-F]{64}$/.test(batch_hash)||!/^0x[0-9a-fA-F]{64}$/.test(transaction_hash)||!/^0x[0-9a-fA-F]{40}$/.test(contract_address)||!Number.isSafeInteger(chain_id))return NextResponse.json({error:'Invalid anchor metadata.'},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return NextResponse.json({saved:false,message:'Transaction is on-chain. Supabase is not configured, so anchor metadata was not persisted.'});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {error}=await db.from('blockchain_anchors').upsert({batch_hash,transaction_hash,contract_address,chain_id,anchored_by:String(body.anchored_by||'').slice(0,100)||null},{onConflict:'batch_hash'});if(error)throw new Error(error.message);
  return NextResponse.json({saved:true,message:'On-chain transaction metadata saved to Supabase.'});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Could not save anchor metadata'},{status:400});}
}
