import { Roles } from '@/shared/_service/interface.schema';
import { DASHBOARD_FOOTER_NAV_ITEMS, DASHBOARD_NAV_ITEMS } from '@/shared/config/sidebarNav.config';
import { canAccess } from '@/shared/utils/access.utils';
import { useMemo } from 'react';

// One place that turns (role + the static config) into "what should actually
// render". Both AppSidebar (desktop) and the dashboard layout's
// MobileBottomNav call this instead of each re-filtering the config, so the
// two surfaces can never drift out of sync.
export function useDashboardNav() {
  // const { isAuthenticated } = useAuth();
  // const { role } = useUser();
  const role: Roles = 'USER';
  const userRoles = useMemo(() => (role ? [role] : []), [role]);

  const mainItems = useMemo(
    () => DASHBOARD_NAV_ITEMS.filter((item) => canAccess(item, true, userRoles)),
    [userRoles]
  );

  const footerItems = useMemo(
    () => DASHBOARD_FOOTER_NAV_ITEMS.filter((item) => canAccess(item, true, userRoles)),
    [userRoles]
  );

  // Bottom nav mirrors the reference design exactly: home / support / map /
  // wallet, four tabs, nothing folded in from the footer (account is reached
  // from Home's profile affordance / the desktop sidebar footer instead —
  // keeps the tab bar from getting crowded on small screens).
  const bottomNavItems = mainItems;

  return { mainItems, footerItems, bottomNavItems };
}
