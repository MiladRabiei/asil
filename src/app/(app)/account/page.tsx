'use client';

import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import Button from '@/shared/UI/Button';
import Loading from '@/shared/UI/Loading';
import { convertToPersianDigits } from '@/shared/utils/digitConvertor.utils';
import { LogOut } from 'lucide-react';

// PLACEHOLDER PRESENTATION — no profile design exists yet. This is
// deliberately minimal (name, phone, logout) rather than a finished
// profile page; profile editing, saved cars, notification preferences,
// etc. are follow-up work once a design exists. Data comes from
// useUser()/useAuth() — swap only the JSX below when a design lands.
export default function AccountPage() {
  const { user, isLoading } = useUser();
  const { logout } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col gap-md p-md">
      <h1 className="text-lg font-semibold">حساب من</h1>

      <div className="rounded-lg border border-border-primary p-md">
        <p className="font-medium">{user?.name}</p>
        {user?.phone && (
          <p className="text-sm text-muted-foreground">{convertToPersianDigits(user.phone)}</p>
        )}
      </div>

      <Button variant="outline" className="gap-2 w-fit" onClick={() => logout()}>
        <LogOut className="size-4" />
        خروج از حساب
      </Button>
    </section>
  );
}
