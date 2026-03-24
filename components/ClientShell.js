'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Navbar'), { ssr: false });

function subscribe() {
  return () => {};
}

// Pages that should be full-screen without sidebar/nav
const FULLSCREEN_ROUTES = ['/', '/login'];

export default function ClientShell({ children, fallback = null }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const pathname = usePathname();

  if (!mounted) return fallback;

  const isFullscreen = FULLSCREEN_ROUTES.includes(pathname);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
