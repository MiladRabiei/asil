'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavList } from '@/shared/layout/Navbar/NavList';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { INavGroup, INavItem } from './interfaces';
export interface NavbarProps {
  itemsRight?: Array<INavItem | INavGroup>;
  logo?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ itemsRight = [], logo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="flex h-14 items-center justify-between border-b px-4">
      {logo}

      <div className="hidden flex-1 justify-end lg:flex">
        <NavList items={itemsRight} variant="desktop" />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Toggle menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <NavList
            items={itemsRight}
            variant="mobile"
            className="mt-8"
            onNavigate={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
