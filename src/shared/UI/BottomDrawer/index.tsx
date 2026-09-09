'use client';

import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import React from 'react';

export interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ isOpen, onClose, children, className }) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent
        className={cn(
          'fixed inset-x-0 bottom-0',
          'flex max-h-[90dvh] flex-col',
          'overflow-hidden',
          'rounded-t-xl border-t bg-white',
          'p-0',
          className
        )}
      >
        {/* Handle */}
        <div className="flex shrink-0 justify-center py-3">
          <div className="h-1 w-20 rounded-full bg-iceberg-200" />
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;
