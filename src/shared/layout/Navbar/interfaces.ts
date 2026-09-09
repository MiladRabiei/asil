import type { Roles } from '@/shared/_service/interface.schema';
import type React from 'react';

interface INavGuard {
  needsAuthenticatedUser?: boolean;
  rolesAllowed?: Roles[];
}

export interface INavItem extends INavGuard {
  title: string;
  linkURL: string;
}

export interface INavCta extends INavGuard {
  title: string;
  linkURL: string;
}

export interface INavGroup extends INavGuard {
  parent: string;
  children: INavItem[];
  cta?: INavCta;
}

export type NavbarData = Array<INavItem | INavGroup>;

export const isNavGroup = (entry: INavItem | INavGroup): entry is INavGroup => 'parent' in entry;
export const isNavItem = (entry: INavItem | INavGroup): entry is INavItem => !isNavGroup(entry);

export interface IBottomNavItem extends INavGuard {
  title: string;
  url: string;
  // Broad enough to accept both lucide icons and imported .svg-as-component
  // icons — both are used interchangeably across nav configs.
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export type BottomNavConfig = IBottomNavItem[];
