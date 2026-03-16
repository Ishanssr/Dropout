'use client';

import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

export default function ClientShell({ children, fallback = null }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return mounted ? children : fallback;
}
