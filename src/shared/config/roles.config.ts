import type { Roles } from '@/shared/_service/interface.schema';

// Single consumer role today. Kept as a list/record (rather than dropping
// the role system entirely) so an operator/back-office role can be added
// later without ripping out access.utils.ts / useDashboardNav.
export const ALL_ROLES: Roles[] = ['USER'];

export const ROLE_LABELS: Record<Roles, string> = {
  USER: 'کاربر',
};

// localStorage key the dev-only role switcher writes to, and the mock user
// fetcher reads from.
export const DEV_ROLE_STORAGE_KEY = 'dev:current-role';

export const DEFAULT_DEV_ROLE: Roles = 'USER';
