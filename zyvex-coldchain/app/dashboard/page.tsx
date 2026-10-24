'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <main style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
      Opening your existing Zyvex dashboard…
    </main>
  );
}