'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import WorkspaceLayout from '../layout/WorkspaceLayout';

type Section = 'shipments' | 'readings' | 'alerts' | 'deliveries' | 'integrity' | 'admin';

const sectionInfo: Record<
  Section,
  { title: string; subtitle: string; description: string; icon: typeof Package; links: { href: string; label: string }[] }
> = {
  shipments: {
    title: 'Shipments',
    subtitle: 'Cold-chain shipment register',
    description: 'Review shipment records and open a shipment to inspect its recorded status and temperature history.',
    icon: Package,
    links: [
      { href: '/dashboard', label: 'Open live dashboard' },
      { href: '/readings', label: 'Review temperature readings' },
    ],
  },
  readings: {
    title: 'Temperature readings',
    subtitle: 'Temperature telemetry',
    description: 'Review readings recorded by your existing telemetry API. Readings should be submitted through a validated server endpoint.',
    icon: Activity,
    links: [
      { href: '/dashboard', label: 'Open reading simulator' },
      { href: '/alerts', label: 'Review temperature alerts' },
    ],
  },
  alerts: {
    title: 'Temperature alerts',
    subtitle: 'Cold-chain exception monitoring',
    description: 'Inspect temperature excursions and investigate affected shipments using the existing dashboard and alert records.',
    icon: AlertTriangle,
    links: [
      { href: '/dashboard', label: 'Open monitoring dashboard' },
      { href: '/integrity', label: 'Review integrity audit' },
    ],
  },
  deliveries: {
    title: 'Deliveries',
    subtitle: 'Receiver and dispatch operations',
    description: 'Coordinate delivery review for hospitals and warehouses. Delivery confirmation should be tied to a shipment and authenticated receiver.',
    icon: Truck,
    links: [
      { href: '/shipments', label: 'View shipments' },
      { href: '/integrity', label: 'Verify shipment integrity' },
    ],
  },
  integrity: {
    title: 'Integrity audit',
    subtitle: 'Shipment data verification',
    description: 'Use the existing integrity verification and blockchain anchor workflow to inspect available audit evidence.',
    icon: ShieldCheck,
    links: [
      { href: '/dashboard', label: 'Open verification dashboard' },
      { href: '/shipments', label: 'Review shipments' },
    ],
  },
  admin: {
    title: 'Administration',
    subtitle: 'System overview',
    description: 'Administrative operations require a separately provisioned administrator role. This page is a navigation placeholder, not an access-control boundary.',
    icon: ClipboardCheck,
    links: [
      { href: '/dashboard', label: 'Open monitoring dashboard' },
      { href: '/integrity', label: 'Review integrity tools' },
    ],
  },
};

export default function WorkspacePage({ section }: { section: Section }) {
  const info = sectionInfo[section];
  const Icon = info.icon;

  return (
    <WorkspaceLayout title={info.title} subtitle={info.subtitle}>
      <section className="intro">
        <div className="icon-wrap"><Icon size={24} /></div>
        <h2>{info.title}</h2>
        <p>{info.description}</p>
        <div className="links">
          {info.links.map((link) => (
            <Link key={link.href + link.label} href={link.href}>
              {link.label}<ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </section>

      <section className="notice">
        <strong>Live data integration is the next step</strong>
        <p>
          This section currently provides navigation and workflow guidance.
          It does not invent shipment records or claim that a delivery,
          sensor reading, or blockchain transaction has occurred.
        </p>
      </section>

      <style jsx>{`
        .intro, .notice { background: white; border: 1px solid #e1e8ef; border-radius: 15px; padding: 24px; }
        .intro { max-width: 760px; }
        .icon-wrap { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 13px; background: #e5f5f3; color: #087f78; }
        h2 { margin: 18px 0 8px; font-size: 22px; }
        p { color: #68798b; font-size: 13px; line-height: 1.8; }
        .links { display: grid; gap: 10px; margin-top: 20px; }
        .links a { display: flex; justify-content: space-between; align-items: center; padding: 13px; border: 1px solid #e5ebf1; border-radius: 9px; color: #087f78; font-size: 12px; text-decoration: none; }
        .links a:hover { background: #f4fbfa; }
        .notice { max-width: 760px; margin-top: 18px; background: #f9fbfd; }
        .notice strong { font-size: 13px; }
        .notice p { margin-bottom: 0; }
      `}</style>
    </WorkspaceLayout>
  );
}