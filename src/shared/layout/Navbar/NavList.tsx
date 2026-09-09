import { Accordion } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Roles } from '@/shared/_service/interface.schema';
import { NavGroupMobile } from '@/shared/layout/Navbar/NavGroupMobile';
import { NavGroup } from './NavGroup';
import { NavItem } from './NavItem';
import { isNavGroup, isNavItem, type NavbarData } from './interfaces';
interface NavListProps {
  items: NavbarData;
  userRoles?: Roles[];
  variant?: 'desktop' | 'mobile';
  className?: string;
  onNavigate?: () => void;
}

export const NavList: React.FC<NavListProps> = ({
  items,
  userRoles = [],
  variant = 'desktop',
  className,
  onNavigate,
}) => {
  if (variant === 'mobile') {
    const flatItems = items.filter(isNavItem);
    const groups = items.filter(isNavGroup);

    return (
      <div className={className}>
        <div className="flex flex-col gap-4">
          {flatItems.map((item) => (
            <NavItem key={item.linkURL} item={item} userRoles={userRoles} onNavigate={onNavigate} />
          ))}
        </div>
        {groups.length > 0 && (
          <Accordion type="multiple" className="mt-2">
            {groups.map((group) => (
              <NavGroupMobile
                key={group.parent}
                group={group}
                userRoles={userRoles}
                onNavigate={onNavigate}
              />
            ))}
          </Accordion>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {items.map((item) =>
        isNavGroup(item) ? (
          <NavGroup key={item.parent} group={item} userRoles={userRoles} />
        ) : (
          <NavItem key={item.linkURL} item={item} userRoles={userRoles} />
        )
      )}
    </div>
  );
};
