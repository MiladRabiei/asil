'use client';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Roles } from '@/shared/_service/interface.schema';
import { canShowNavEntry } from '@/shared/layout/Navbar/util';
import Link from 'next/link';
import type { INavGroup } from './interfaces';

export const NavGroupMobile: React.FC<{
  group: INavGroup;
  userRoles?: Roles[];
  onNavigate?: () => void;
}> = ({ group, userRoles = [], onNavigate }) => {
  const { isAuthenticated } = useAuth();

  if (!canShowNavEntry(group, isAuthenticated, userRoles)) return null;

  const visibleChildren = group.children.filter((c) =>
    canShowNavEntry(c, isAuthenticated, userRoles)
  );
  if (!visibleChildren.length && !group.cta) return null;

  return (
    <AccordionItem value={group.parent}>
      <AccordionTrigger className="py-2 text-sm">{group.parent}</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 ps-3">
        {visibleChildren.map((child) => (
          <Link
            key={child.linkURL}
            href={child.linkURL}
            onClick={onNavigate}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {child.title}
          </Link>
        ))}
        {group.cta && (
          <Button asChild size="sm" onClick={onNavigate}>
            <Link href={group.cta.linkURL}>{group.cta.title}</Link>
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
