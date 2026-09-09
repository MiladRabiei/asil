'use client';

import { useAuth } from '@/context/AuthContext';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, LogOut, Menu, User, Zap } from 'lucide-react';
import Link from 'next/link';

export interface AppTopBarProps {
  // Small breadcrumb-style label above the title, e.g. "Scan" in the
  // reference design — optional, most screens don't need it.
  eyebrow?: string;
  className?: string;
}

// Shared header for every (app) screen — logo/title, a notifications
// shortcut, and a hamburger menu covering the account/logout actions that
// don't get their own bottom-nav tab (see sidebarNav.config.ts comment).
export function AppTopBar({ eyebrow, className }: AppTopBarProps) {
  const { logout } = useAuth();

  return (
    <header className={`w-full flex flex-col gap-1 px-md pt-md ${className ?? ''}`}>
      {eyebrow && <span className="text-xs text-muted-foreground">{eyebrow}</span>}
      <div className="flex items-center justify-between">
        <Link href="/notifications" aria-label="اعلان‌ها" className="rounded-full bg-foreground/5 p-2">
          <Bell className="size-5" />
        </Link>

        <Link href="/" className="flex items-center gap-1.5">
          <Zap className="size-5 fill-primary text-primary" />
          <span className="font-semibold">Asil</span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="منو" className="rounded-full bg-foreground/5 p-2">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>منو</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-xs p-md">
              <SheetClose asChild>
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg p-sm hover:bg-muted"
                >
                  <User className="size-4" />
                  حساب من
                </Link>
              </SheetClose>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 rounded-lg p-sm text-red-500 hover:bg-muted"
              >
                <LogOut className="size-4" />
                خروج از حساب
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
