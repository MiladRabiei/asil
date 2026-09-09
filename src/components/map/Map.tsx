'use client';

import dynamic from 'next/dynamic';

// OpenLayers touches `window` at import time — must stay client-only.
export const NeshanMap = dynamic(() => import('./NeshanMap'), { ssr: false });
export const Map = { Provider: NeshanMap };
