'use client';
import { FormEvent, useState } from 'react';
import { createBrowserSupabase } from '../../src/supabase/browser';
export default function SignInPage() {
 const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
 async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setMessage(''); try { const client=createBrowserSupabase(); const {error}=await client.auth.signInWithPassword({email,password}); if(error) throw error; window.location.href='/'; } catch(err) { setMessage(err instanceof Error ? err.message : 'Sign-in failed. Configure Supabase Auth first.'); } finally { setBusy(false); } }
 return <main className="auth-page"><form className="auth-card" onSubmit={submit}><p className="eyebrow">ZYVEX · SECURE ACCESS</p><h1>Sign in</h1><p>Use your Supabase Auth account to access the workspace.</p><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} /></label><button disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button>{message&&<p role="alert">{message}</p>}<a href="/">Back to demo dashboard</a></form></main>;
}
