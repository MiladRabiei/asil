import type { Roles } from '@/shared/_service/interface.schema';

// Anything that can be gated by auth state and/or role — nav items, sidebar
// entries, bottom-nav items, routes, etc. all extend this instead of
// re-declaring the same two optional fields.
export interface IRoleGuard {
  needsAuthenticatedUser?: boolean;
  rolesAllowed?: Roles[];
}

/**
 * Single source of truth for "should this entry be visible/reachable".
 * - No `rolesAllowed` (undefined or empty) => visible to every role.
 * - `rolesAllowed` set => visible only if the user has one of those roles.
 */
export function canAccess(
  guard: IRoleGuard,
  isAuthenticated: boolean,
  userRoles: Roles[] = []
): boolean {
  if (guard.needsAuthenticatedUser && !isAuthenticated) return false;
  if (guard.rolesAllowed?.length && !guard.rolesAllowed.some((r) => userRoles.includes(r))) {
    return false;
  }
  return true;
}
