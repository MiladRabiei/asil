'use client';
import { useDashboardNav } from '@/shared/hooks/useDashboardNav';
import MobileBottomNav from '@/shared/layout/Navbar/MobileBottomNav';

// Shell for every authenticated screen (map, branch detail, wallet, scan,
// account). Desktop gets the collapsible sidebar; mobile gets the bottom
// tab bar — both read the same nav config via useDashboardNav so they can
// never drift apart. This used to be the B2B "dashboard" shell; renamed
// since in this consumer app it wraps the whole logged-in experience, not
// just a dashboard page.
const AppShellLayout = ({ children }: { children: React.ReactNode }) => {
  console.log('🔥 AppShellLayout rendered');
  // const { isAuthenticated } = useAuth();
  const { bottomNavItems } = useDashboardNav();

  return (
    <div dir="rtl" className="w-full min-h-dvh">
      {children}
      <MobileBottomNav items={bottomNavItems} isAuthenticated={true} userRoles={['USER']} />
    </div>
  );
};

export default AppShellLayout;
