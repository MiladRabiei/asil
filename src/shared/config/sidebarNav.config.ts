import type { IRoleGuard } from '@/shared/utils/access.utils';
import { Headphones, LogOut, MapPin, User, Wallet2 } from 'lucide-react';
import { Home } from 'lucide-react';
import React from 'react';

export interface IDashboardNavItem extends IRoleGuard {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Everything about "which links show up where" lives in this one array —
// AppSidebar (desktop), MobileBottomNav (mobile), and any future route
// guard all read from it via useDashboardNav instead of keeping their own
// copies. `rolesAllowed` omitted/empty => visible to every role.
//
// Scan isn't a persistent tab here — it's reached from Home's primary CTA
// and from a branch's own "scan this station" button, matching the
// reference design (bottom nav = home / support / map / wallet only).
export const DASHBOARD_NAV_ITEMS: IDashboardNavItem[] = [
  { title: 'خانه', url: '/', icon: Home, needsAuthenticatedUser: true },
  { title: 'پشتیبانی', url: '/support', icon: Headphones, needsAuthenticatedUser: true },
  { title: 'نقشه شارژ', url: '/map', icon: MapPin, needsAuthenticatedUser: true },
  { title: 'کیف پول', url: '/wallet', icon: Wallet2, needsAuthenticatedUser: true },
];

export const DASHBOARD_FOOTER_NAV_ITEMS: IDashboardNavItem[] = [
  { title: 'حساب من', url: '/account', icon: User, needsAuthenticatedUser: true },
];

export const LOGOUT_NAV_ITEM = { title: 'خروج', icon: LogOut };
