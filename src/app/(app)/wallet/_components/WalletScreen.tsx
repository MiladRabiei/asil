'use client';

import { useGetWallet } from '@/shared/_service/hook.query';
import { AppTopBar } from '@/shared/layout/AppTopBar';
import Button from '@/shared/UI/Button';
import Loading from '@/shared/UI/Loading';
import type { IWalletTransaction } from '@/shared/_service/interface.ev';
import { convertToPersianDigits } from '@/shared/utils/digitConvertor.utils';
import { Plus } from 'lucide-react';

function formatToman(amount: number) {
  return convertToPersianDigits(Math.abs(amount).toLocaleString('en-US')) + ' تومان';
}

const TX_LABEL: Record<IWalletTransaction['type'], string> = {
  TOPUP: 'افزایش موجودی',
  CHARGE_PAYMENT: 'پرداخت شارژ',
  REFUND: 'بازگشت وجه',
};

// PLACEHOLDER PRESENTATION — no wallet design exists yet, so this is
// deliberately plain: balance + top-up action + a flat transaction list,
// using the app's design tokens rather than a bespoke hero treatment. The
// data contract (useGetWallet / IWallet / IWalletTransaction) is the part
// that's "final" here — swap only the JSX below once a design lands.
export default function WalletScreen() {
  const { data: wallet, isLoading } = useGetWallet();

  return (
    <>
      <AppTopBar />
      <section className="w-full flex flex-col gap-md p-md">
        <h1 className="text-lg font-semibold">کیف پول</h1>

        {isLoading || !wallet ? (
          <div className="w-full h-40 flex items-center justify-center">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-sm rounded-xl border border-border-primary p-lg">
              <span className="text-sm text-muted-foreground">موجودی فعلی</span>
              <span className="text-2xl font-bold">{formatToman(wallet.balance)}</span>
              {/* TODO: wire to a real payment-gateway top-up flow */}
              <Button variant="outline" className="gap-2 mt-sm">
                <Plus className="size-4" />
                افزایش موجودی
              </Button>
            </div>

            <div className="flex flex-col gap-xs">
              <h2 className="text-sm font-semibold">تراکنش‌های اخیر</h2>
              {wallet.transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">هنوز تراکنشی ثبت نشده است.</p>
              )}
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border-primary p-sm"
                >
                  <div>
                    <p className="text-sm font-medium">{TX_LABEL[tx.type]}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount < 0 ? 'text-error' : 'text-success'}`}>
                    {tx.amount < 0 ? '-' : '+'}
                    {formatToman(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
