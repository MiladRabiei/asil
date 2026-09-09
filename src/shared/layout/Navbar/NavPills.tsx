// NavPills.tsx — segmented pill nav (flat items, no dropdowns)
'use client';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { Roles } from '@/shared/_service/interface.schema';
import { canShowNavEntry } from '@/shared/layout/Navbar/util';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { INavItem } from './interfaces';

export const NavPills: React.FC<{ items: INavItem[]; userRoles?: Roles[] }> = ({
  items,
  userRoles = [],
}) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const visible = items?.filter((item) => canShowNavEntry(item, isAuthenticated, userRoles));
  if (!visible?.length) return null;

  return (
    <div className="flex items-center gap-sm rounded-full bg-muted p-1 w-141">
      {visible.map((item) => {
        const isActive = pathname === item.linkURL;
        return (
          <Link
            key={item.linkURL}
            href={item.linkURL}
            className={cn(
              'rounded-full  text-base  transition-colors w-32.5 flex items-center justify-center py-sm',
              isActive
                ? 'bg-background text-foreground font-semibold shadow-md'
                : 'text-muted-foreground hover:text-foreground font-medium'
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
};
