import { DEFAULT_DEV_ROLE, DEV_ROLE_STORAGE_KEY } from '@/shared/config/roles.config';
import type { IUser, Roles } from './interface.schema';

const MOCK_USERS: Record<Roles, IUser> = {
  USER: { id: 'mock-user', name: 'کاربر تست', phone: '09120000000', role: 'USER' },
};

function readDevRoleOverride(): Roles | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(DEV_ROLE_STORAGE_KEY);
  return stored && stored in MOCK_USERS ? (stored as Roles) : null;
}

// STUB — replace with a real network call once ME_ROUTE exists (see
// hook.query.tsx). Kept as a plain async function with the same return shape
// so swapping it later is a one-line change in useGetCurrentUser.
export async function fetchMockCurrentUser(): Promise<IUser> {
  const role = readDevRoleOverride() ?? DEFAULT_DEV_ROLE;
  return Promise.resolve(MOCK_USERS[role]);
}
