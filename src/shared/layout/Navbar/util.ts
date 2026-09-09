import type { Roles } from '@/shared/_service/interface.schema';

interface Guardable {
  needsAuthenticatedUser?: boolean;
  rolesAllowed?: Roles[];
}

export function canShowNavEntry(
  entry: Guardable,
  isAuthenticated: boolean,
  userRoles: Roles[] = []
): boolean {
  if (entry.needsAuthenticatedUser && !isAuthenticated) return false;
  if (entry.rolesAllowed?.length && !entry.rolesAllowed.some((r) => userRoles.includes(r))) {
    return false;
  }
  return true;
}
