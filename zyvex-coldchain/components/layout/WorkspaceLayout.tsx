'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { createClient } from '../../lib/supabase-browser';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shipments', label: 'Shipments', icon: Package },
  { href: '/readings', label: 'Temperature readings', icon: Activity },
  { href: '/alerts', label: 'Temperature alerts', icon: AlertTriangle },
  { href: '/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/integrity', label: 'Integrity audit', icon: ShieldCheck },
  { href: '/admin', label: 'Administration', icon: Boxes },
];

export default function WorkspaceLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <main className="workspace">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-icon">Z</span>
          <span>
            <strong>ZYVEX</strong>
            <small>COLDCHAIN LEDGER</small>
          </span>
        </Link>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === '/shipments' &&
                pathname.startsWith('/shipments/'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-label">
            <ShieldCheck size={16} />
            Cold-chain workspace
          </div>
          <button className="signout" onClick={signOut}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">ZYVEX / OPERATIONS</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="system-status">
            <span className="status-dot" /> Workspace
          </span>
        </header>

        <div className="page-content">{children}</div>
      </section>

      <style jsx>{`
        .workspace {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr);
          background: #f4f7fb;
          color: #15283c;
          font-family: Arial, sans-serif;
        }
        .sidebar {
          background: #091d2c;
          color: #e8f1f6;
          padding: 26px 16px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .brand {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 0 7px 30px;
          color: inherit;
          text-decoration: none;
        }
        .brand-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid #43d2bd;
          color: #69e0ce;
          border-radius: 12px;
          font-size: 23px;
          font-weight: 800;
        }
        .brand strong, .brand small { display: block; }
        .brand strong { letter-spacing: 2px; font-size: 14px; }
        .brand small { margin-top: 5px; color: #93a9b9; font-size: 9px; letter-spacing: 1.2px; }
        .nav-label { padding-left: 10px; font-size: 10px; color: #7892a3; letter-spacing: 1.5px; }
        nav { display: grid; gap: 5px; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 10px;
          border-radius: 9px;
          color: #b9cad6;
          text-decoration: none;
          font-size: 12px;
          transition: background .2s, color .2s, transform .2s;
        }
        .nav-link:hover { background: #163548; color: white; transform: translateX(2px); }
        .nav-link.active { background: #124a4d; color: #77e6d5; }
        .sidebar-bottom { margin-top: auto; padding-top: 28px; }
        .secure-label { display: flex; gap: 8px; align-items: center; color: #9ab3c0; font-size: 10px; }
        .signout {
          display: flex; gap: 9px; align-items: center; margin-top: 20px;
          padding: 11px 8px; width: 100%; border: 1px solid #2c4353;
          background: transparent; color: #d7e4eb; border-radius: 9px; cursor: pointer;
        }
        .main-area { min-width: 0; }
        .topbar {
          background: white; border-bottom: 1px solid #e4eaf0;
          padding: 28px 34px; display: flex; justify-content: space-between;
          gap: 20px; align-items: center;
        }
        .eyebrow { font-size: 9px; letter-spacing: 1.7px; color: #0c9288; font-weight: 800; }
        h1 { font-size: 26px; letter-spacing: -0.8px; margin: 10px 0 5px; }
        .topbar p { color: #718195; font-size: 12px; margin: 0; }
        .system-status { white-space: nowrap; font-size: 11px; color: #536a7b; }
        .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #0ba98c; margin-right: 7px; }
        .page-content { padding: 28px 34px; animation: enter .3s ease both; }
        @keyframes enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 800px) {
          .workspace { grid-template-columns: 1fr; }
          .sidebar { min-height: auto; padding: 15px; }
          .brand { padding-bottom: 12px; }
          .sidebar nav { display: flex; overflow-x: auto; padding-bottom: 8px; }
          .nav-label, .sidebar-bottom { display: none; }
          .nav-link { white-space: nowrap; }
          .topbar { padding: 22px 18px; }
          .page-content { padding: 20px 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .page-content { animation: none; }
          .nav-link { transition: none; }
        }
      `}</style>
    </main>
  );
}