'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Navbar'), { ssr: false });

function subscribe() {
  return () => {};
}

export default function ClientShell({ children, fallback = null }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) return fallback;

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
