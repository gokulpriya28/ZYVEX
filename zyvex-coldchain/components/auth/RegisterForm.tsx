'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

const roles = [
  { value: 'manufacturer', label: 'Manufacturer / Shipper' },
  { value: 'transport', label: 'Transport Logistics' },
  { value: 'receiver', label: 'Hospital / Warehouse Receiver' },
];

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('manufacturer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: company,
            requested_role: role,
          },
        },
      });

      if (signupError) throw signupError;

      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setMessage(
          'Account request submitted. Check your email to confirm registration if email confirmation is enabled.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="brand-mark">Z</div>
        <p className="eyebrow">ZYVEX COLDCHAIN LEDGER</p>
        <h1>Create your workspace</h1>
        <p className="muted">
          Join the cold-chain shipment monitoring platform.
        </p>

        <form onSubmit={handleRegister}>
          <label htmlFor="full-name">Full name</label>
          <input
            id="full-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="company">Company or organization</label>
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company / hospital / warehouse"
            autoComplete="organization"
            required
          />

          <label htmlFor="role">Organization type</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label htmlFor="register-email">Work email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            autoComplete="new-password"
            required
          />

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button disabled={loading} type="submit">
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className="footer">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
        <p className="note">
          Administrator access is provisioned separately.
        </p>
      </section>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          padding: 35px 18px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top left, #e2f5f2, transparent 45%),
            #f5f7fb;
          color: #102238;
          font-family: Arial, sans-serif;
        }
        .register-card {
          width: 100%;
          max-width: 460px;
          padding: 35px;
          background: white;
          border: 1px solid #e1e8ef;
          border-radius: 20px;
          box-shadow: 0 18px 55px #12283c12;
          animation: enter .4s ease both;
        }
        .brand-mark {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: #0b2939;
          color: #69e0ce;
          font-size: 23px;
          font-weight: 800;
        }
        .eyebrow {
          margin-top: 22px;
          color: #07877e;
          letter-spacing: 1.7px;
          font-size: 10px;
          font-weight: 800;
        }
        h1 { margin: 10px 0; font-size: 29px; letter-spacing: -1px; }
        .muted { margin-bottom: 23px; color: #728093; font-size: 13px; line-height: 1.6; }
        form { display: flex; flex-direction: column; }
        label { margin: 13px 0 7px; font-size: 12px; font-weight: 700; }
        input, select {
          box-sizing: border-box;
          width: 100%;
          padding: 12px;
          border: 1px solid #dbe3eb;
          border-radius: 9px;
          background: white;
          color: #102238;
          font-size: 13px;
        }
        input:focus, select:focus { outline: 2px solid #15998d40; border-color: #15998d; }
        button {
          margin-top: 23px;
          padding: 14px;
          border: 0;
          border-radius: 9px;
          background: #087f78;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled { opacity: .65; cursor: wait; }
        .error, .success { font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
        .error { color: #bd3030; }
        .success { color: #087f78; }
        .footer { margin-top: 22px; text-align: center; color: #667587; font-size: 12px; }
        .footer a { color: #087f78; font-weight: 700; text-decoration: none; }
        .note { text-align: center; font-size: 10px; color: #8994a2; margin-top: 20px; }
        @keyframes enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .register-card { padding: 25px 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .register-card { animation: none; }
        }
      `}</style>
    </main>
  );
}