'use client';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { Roles } from '@/shared/_service/interface.schema';
import { canShowNavEntry } from '@/shared/layout/Navbar/util';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { INavItem } from './interfaces';

export const NavItem: React.FC<{
  item: INavItem;
  userRoles?: Roles[];
  onNavigate?: () => void;
}> = ({ item, userRoles = [], onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!canShowNavEntry(item, isAuthenticated, userRoles)) return null;

  const isActive = pathname === item.linkURL;

  return (
    <Link
      href={item.linkURL}
      onClick={onNavigate}
      className={cn(
        'text-sm transition-colors hover:text-primary',
        isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
      )}
    >
      {item.title}
    </Link>
  );
};
