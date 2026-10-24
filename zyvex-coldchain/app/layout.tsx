import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zyvex ColdChain | Verifiable transport records',
  description: 'Tamper-evident cold-chain shipment records with digital signatures and optional blockchain anchoring.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
