'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import type { Roles } from '@/shared/_service/interface.schema';
import { canShowNavEntry } from '@/shared/layout/Navbar/util';
import Link from 'next/link';
import type { INavGroup } from './interfaces';

export const NavGroup: React.FC<{ group: INavGroup; userRoles?: Roles[] }> = ({
  group,
  userRoles = [],
}) => {
  const { isAuthenticated } = useAuth();

  if (!canShowNavEntry(group, isAuthenticated, userRoles)) return null;

  const visibleChildren = group.children.filter((c) =>
    canShowNavEntry(c, isAuthenticated, userRoles)
  );
  if (!visibleChildren.length && !group.cta) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm text-muted-foreground outline-none hover:text-primary">
        {group.parent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {visibleChildren.map((child) => (
          <DropdownMenuItem key={child.linkURL} asChild>
            <Link href={child.linkURL}>{child.title}</Link>
          </DropdownMenuItem>
        ))}
        {group.cta && (
          <div className="p-1 pt-2">
            <Button asChild size="sm" className="w-full">
              <Link href={group.cta.linkURL}>{group.cta.title}</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
