'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LOGOUT_NAV_ITEM } from '@/shared/config/sidebarNav.config';
import { useDashboardNav } from '@/shared/hooks/useDashboardNav';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// -----------------------------------------------------------------------------
// AppSidebar
// -----------------------------------------------------------------------------
// Nav items themselves live in `@/shared/config/sidebarNav.config` and are
// filtered by role via `useDashboardNav` — this component only renders
// whatever comes back from that hook. Adding/hiding a page per role never
// requires touching this file.

interface AppSidebarProps {
  onLogout?: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const activeUrl = usePathname();
  const { mainItems, footerItems } = useDashboardNav();

  return (
    <Sidebar side="right" collapsible="icon" className="border-sidebar-border border-l ">
      <SidebarHeader className="border-sidebar-border border-b px-md h-30 flex-row items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:border-0">
        <SidebarMenuButton asChild className="h-12 text-sidebar-foreground">
          <Link
            className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center"
            href={'/'}
          >
            <Zap className="size-8 shrink-0 fill-primary text-primary" />{' '}
            <span className="text-sidebar-foreground truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              شارژ من
            </span>
          </Link>
        </SidebarMenuButton>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = activeUrl === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-12
                        ${
                          isActive
                            ? 'border-blue-500! bg-blue-100! text-blue-500! hover:bg-sidebar-active-bg hover:text-sidebar-active-foreground rounded-none border-r-3 font-medium group-data-[collapsible=icon]:border-r-0 '
                            : 'text-sidebar-foreground'
                        }
                        `}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={isActive ? 'text-blue-500' : 'text-sidebar-foreground'}
                        />
                        <span className="group-data-[collapsible=icon]:hidden font-semibold">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t group-data-[collapsible=icon]:border-0">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden font-semibold">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={LOGOUT_NAV_ITEM.title}
              onClick={onLogout}
              className="text-error"
            >
              <LOGOUT_NAV_ITEM.icon />
              <span className="group-data-[collapsible=icon]:hidden font-semibold">
                {LOGOUT_NAV_ITEM.title}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
