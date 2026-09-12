'use client';

import { openNeshanLocation } from '@/lib/map';
import Button from '@/shared/UI/Button';
import DetailRow from '@/shared/UI/DetailRow';
import { NotificationBellToggle } from '@/shared/UI/NotificationBellToggle';
import type { IChargingBranch, IConnectorStatus } from '@/shared/_service/interface.ev';
import { NavigationIcon, QrCode } from 'lucide-react';
import Link from 'next/link';

const STATUS_LABEL: Record<IChargingBranch['status'], string> = {
  AVAILABLE: 'دارای جای خالی',
  FULL: 'پر - در انتظار خالی شدن',
  OUT_OF_SERVICE: 'خارج از سرویس',
};

const STATUS_BADGE_CLASS: Record<IChargingBranch['status'], string> = {
  AVAILABLE: 'bg-success/10 text-success',
  FULL: 'bg-warning/10 text-warning',
  OUT_OF_SERVICE: 'bg-error/10 text-error',
};

const CONNECTOR_STATUS_LABEL: Record<IConnectorStatus, string> = {
  AVAILABLE: 'خالی',
  IN_USE: 'در حال شارژ',
  OUT_OF_SERVICE: 'خراب',
};

// PLACEHOLDER PRESENTATION — no branch-detail design exists yet. Structure
// (status, connector list, navigate/scan actions, notify bell) is the part
// that's final; colors/spacing/copy below are a plain stand-in using the
// app's design tokens, safe to restyle without touching `branch` or the
// data-fetching container (BranchDetailContainer.tsx).
export default function BranchDetail({ branch }: { branch: IChargingBranch }) {
  const isOutOfService = branch.status === 'OUT_OF_SERVICE';

  const handleNavigate = () => {
    openNeshanLocation(branch.position);
  };

  return (
    <section className="w-full flex flex-col gap-md p-md">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <h1 className="text-lg font-semibold">{branch.name}</h1>
          <p className="text-sm text-muted-foreground">{branch.address}</p>
        </div>
        <NotificationBellToggle topicId={branch.id} topicType="branch" />
      </div>

      <span
        className={`inline-flex w-fit rounded-md px-3 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[branch.status]}`}
      >
        {STATUS_LABEL[branch.status]}
      </span>

      {isOutOfService && (
        <div className="rounded-lg bg-error/10 p-sm text-xs text-error">
          این ایستگاه در حال حاضر خارج از سرویس است. با فعال کردن زنگوله بالا، به محض فعال شدن مجدد
          به شما اطلاع می‌دهیم.
        </div>
      )}

      <div className="flex flex-col gap-xs rounded-lg border border-border-primary p-sm">
        <h2 className="text-sm font-semibold mb-1">پایانه‌های شارژ</h2>
        {branch.connectors.map((c) => (
          <DetailRow
            key={c.id}
            label={`${c.type} · ${c.powerKw} kW`}
            value={CONNECTOR_STATUS_LABEL[c.status]}
            highlight={c.status === 'AVAILABLE'}
          />
        ))}
      </div>

      <div className="flex flex-col gap-sm mt-sm">
        <Button onClick={handleNavigate} disabled={isOutOfService} className="gap-2">
          <NavigationIcon className="size-4" />
          مسیریابی با نشان
        </Button>

        <Link href={`/scan?branchId=${branch.id}`}>
          <Button variant="outline" disabled={isOutOfService} className="w-full gap-2">
            <QrCode className="size-4" />
            اسکن کد این ایستگاه
          </Button>
        </Link>
      </div>
    </section>
  );
}
