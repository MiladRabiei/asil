'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SPLASH_DURATION_MS = 1200;
const FADE_DURATION_MS = 250;

export default function AppSplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(hideTimer);
  }, []);

  return (
    <>
      {children}

      <div
        aria-hidden={!visible}
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a] transition-opacity ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-28 overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="/icons/icon-512.png"
              alt="Asil"
              fill
              priority
              sizes="112px"
              className="object-cover"
            />
          </div>
          <p className="text-2xl font-bold tracking-wide text-white">Asil</p>
        </div>
      </div>
    </>
  );
}
