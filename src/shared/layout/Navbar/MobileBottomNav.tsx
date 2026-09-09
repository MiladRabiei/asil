'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Roles } from '@/shared/_service/interface.schema';
import { IBottomNavItem } from '@/shared/layout/Navbar/interfaces';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
interface MobileBottomNavProps {
  items: IBottomNavItem[];
  isAuthenticated?: boolean;
  userRoles?: Roles[];
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  isAuthenticated = true,
  userRoles = [],
}) => {
  const pathname = usePathname();

  const visibleItems = items.filter((item) => {
    if (item.needsAuthenticatedUser && !isAuthenticated) return false;
    if (item.rolesAllowed?.length && !item.rolesAllowed.some((r) => userRoles.includes(r))) {
      return false;
    }
    return true;
  });
  console.log(visibleItems);
  return (
    <nav
      dir="ltr"
      className="bg-sidebar border-sidebar-border flex h-16 items-center justify-around border-t lg:hidden"
    >
      {visibleItems.map((item) => {
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.url}
            href={item.url}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium',
              isActive ? 'text-blue-500 font-semibold' : 'text-sidebar-foreground'
            )}
          >
            <span className="relative">
              <item.icon className="size-6" />
              {!!item.badge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -left-1.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </span>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
