'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { Roles } from '@/shared/_service/interface.schema';
import { NavList } from '@/shared/layout/Navbar/NavList';
import { NavPills } from '@/shared/layout/Navbar/NavPills';
import { INavItem } from '@/shared/layout/Navbar/interfaces';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export interface HeaderProps {
  items: INavItem[];
  userRoles?: Roles[];
  authHref?: string;
}

const Header: React.FC<HeaderProps> = ({ items, userRoles = [], authHref = '/auth' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="flex h-16 items-center justify-between border-b lg:border-0 p-md lg:h-28 lg:px-16 lg:py-8 ">
      <div className="flex items-center gap-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button aria-label="Toggle menu" className="text-foreground">
              <Menu className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <NavList
              items={items}
              userRoles={userRoles}
              variant="mobile"
              className="mt-8"
              onNavigate={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <Link href="/" className="shrink-0">
          <Image
            // TODO: swap for a real EV-app logo — this is still the GSM
            // Service boilerplate's placeholder asset.
            src="/img/logo/service-logo.png"
            alt="EV Charging App"
            width={80}
            height={47}
            className="w-10 h-6 lg:w-20 lg:h-12"
          />
        </Link>

        <div className="hidden lg:block">
          <NavPills items={items} userRoles={userRoles} />
        </div>
      </div>

      <Button
        variant="secondary"
        asChild
        className="rounded-full w-26 h-8 lg:w-40 lg:h-12 text-[12px] font-medium lg:text-base lg:font-semibold"
      >
        <Link href={authHref}>ورود یا ثبت‌نام</Link>
      </Button>
    </header>
  );
};

export default Header;
