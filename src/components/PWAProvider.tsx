'use client';

import { useEffect } from 'react';

export default function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        // No-op: registration success.
      } catch (error) {
        console.error('Service worker registration failed', error);
      }
    };

    register();
  }, []);

  return null;
}

