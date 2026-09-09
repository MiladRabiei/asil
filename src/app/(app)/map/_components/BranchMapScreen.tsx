'use client';

import { BranchMap } from '@/components/map';

// No SSR guard needed here — components/map/Map.tsx already wraps the
// OpenLayers renderer in next/dynamic({ ssr: false }); BranchMap itself is
// safe to import eagerly.
export default function BranchMapScreen() {
  return (
    <section className="w-full h-full">
      <BranchMap />
    </section>
  );
}
