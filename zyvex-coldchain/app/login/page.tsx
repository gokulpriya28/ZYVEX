'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-logo">Z</div>
        <p className="login-eyebrow">COLD CHAIN INTELLIGENCE</p>
        <h1>Protect every shipment.<br />Prove every journey.</h1>
        <p className="login-description">
          Monitor temperature, track deliveries and verify shipment
          integrity from dispatch to destination.
        </p>
        <div className="login-feature">
          <span>01</span> Temperature monitoring
        </div>
        <div className="login-feature">
          <span>02</span> Shipment traceability
        </div>
        <div className="login-feature">
          <span>03</span> Integrity verification
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="login-eyebrow">ZYVEX COLDCHAIN LEDGER</p>
          <h2>Welcome back</h2>
          <p className="login-muted">
            Sign in to access your cold-chain workspace.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in securely →'}
            </button>
          </form>

          <p className="login-footer">
            New to Zyvex? <Link href="/register">Create an account</Link>
          </p>
          <p className="login-security">
            Secured authentication · Shipment integrity workspace
          </p>
        </div>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f7f9fc;
          color: #102238;
          font-family: Arial, sans-serif;
        }
        .login-brand {
          padding: 10vh 9%;
          color: #fff;
          background: radial-gradient(circle at 15% 10%, #174b61, transparent 40%),
            linear-gradient(145deg, #071827, #0b2639 65%, #103b48);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border: 1px solid #56d6c4;
          border-radius: 14px;
          color: #56d6c4;
          font-size: 25px;
          font-weight: 800;
          margin-bottom: 35px;
        }
        .login-eyebrow {
          color: #149b91;
          letter-spacing: 2px;
          font-size: 11px;
          font-weight: 800;
        }
        .login-brand .login-eyebrow {
          color: #65e0d0;
        }
        .login-brand h1 {
          font-size: clamp(32px, 4vw, 53px);
          line-height: 1.12;
          letter-spacing: -1.8px;
          margin: 16px 0;
        }
        .login-description {
          max-width: 440px;
          color: #b8cbd7;
          line-height: 1.8;
          font-size: 15px;
          margin-bottom: 35px;
        }
        .login-feature {
          padding: 15px 0;
          border-top: 1px solid #ffffff20;
          color: #e3edf2;
          font-size: 14px;
        }
        .login-feature span {
          color: #65e0d0;
          margin-right: 18px;
          font-size: 11px;
        }
        .login-panel {
          display: grid;
          place-items: center;
          padding: 35px 24px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 390px;
          animation: enter .5s ease both;
        }
        .login-form-wrap h2 {
          font-size: 32px;
          margin: 15px 0 8px;
          letter-spacing: -1px;
        }
        .login-muted {
          color: #748294;
          font-size: 14px;
          margin-bottom: 30px;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        label {
          font-size: 13px;
          font-weight: 700;
          margin: 17px 0 8px;
        }
        input {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          border: 1px solid #dbe3eb;
          border-radius: 10px;
          background: white;
          font-size: 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        input:focus {
          border-color: #149b91;
          box-shadow: 0 0 0 3px #149b911c;
        }
        button {
          margin-top: 25px;
          padding: 15px;
          border: 0;
          border-radius: 10px;
          background: #087f78;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .2s, background .2s;
        }
        button:hover {
          background: #066861;
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: .65;
          cursor: wait;
        }
        .login-error {
          margin-top: 14px;
          color: #bd3030;
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .login-footer {
          margin-top: 25px;
          font-size: 13px;
          color: #667587;
        }
        .login-footer a {
          color: #087f78;
          font-weight: 700;
          text-decoration: none;
        }
        .login-security {
          margin-top: 45px;
          color: #95a0ae;
          font-size: 11px;
          text-align: center;
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 760px) {
          .login-page { grid-template-columns: 1fr; }
          .login-brand { padding: 35px 8%; }
          .login-brand h1 { font-size: 34px; }
          .login-description { margin-bottom: 15px; }
          .login-feature { padding: 10px 0; }
          .login-panel { padding: 45px 24px; }
          .login-security { margin-top: 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-form-wrap { animation: none; }
          * { transition: none !important; }
        }
      `}</style>
    </main>
  );
}