'use client';

import { openNeshanLocation } from '@/lib/map';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import { MapPin, Navigation, PlugZap, X } from 'lucide-react';
import Link from 'next/link';

export interface BranchPopupProps {
  branch: IChargingBranch;
  onClose: () => void;
}

const STATUS_LABEL: Record<IChargingBranch['status'], string> = {
  AVAILABLE: 'دارای جای خالی',
  FULL: 'پر',
  OUT_OF_SERVICE: 'خارج از سرویس',
};

const STATUS_DOT: Record<IChargingBranch['status'], string> = {
  AVAILABLE: 'bg-success',
  FULL: 'bg-warning',
  OUT_OF_SERVICE: 'bg-error',
};

// PLACEHOLDER PRESENTATION — no design exists yet for the map popup, so this
// is deliberately plain (app design tokens, no bespoke styling) rather than
// a finished card. `branch` is the real data contract; swap only the JSX
// below once a design lands, nothing upstream (BranchMap, hook.query) needs
// to change. The full connector list, out-of-service messaging, and
// notify-me bell live on the branch-detail page (/map/[branchId]) — this is
// deliberately lighter, a compact summary only.
export default function BranchPopup({ branch, onClose }: BranchPopupProps) {
  const connectorTypes = [...new Set(branch.connectors.map((c) => c.type))];

  return (
    <section
      dir="rtl"
      className="w-[min(88vw,320px)] rounded-xl border border-border-primary bg-background p-4 text-foreground shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold">{branch.name}</h3>
          <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            {branch.address}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        <span className={`size-2 rounded-full ${STATUS_DOT[branch.status]}`} />
        {STATUS_LABEL[branch.status]}
      </div>

      {connectorTypes.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <PlugZap className="size-3.5" />
          {connectorTypes.join(' · ')}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => openNeshanLocation(branch.position)}
          disabled={branch.status === 'OUT_OF_SERVICE'}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          <Navigation className="size-3.5" />
          مسیریابی
        </button>
        <Link
          href={`/map/${branch.id}`}
          className="flex flex-1 items-center justify-center rounded-lg border border-border-primary px-3 py-2 text-xs font-semibold"
        >
          جزئیات ایستگاه
        </Link>
      </div>
    </section>
  );
}
