'use client';

import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ArrowRight, X } from 'lucide-react';
import React from 'react';

export interface ModalWrapperProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isOpen?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  withCloseButton?: boolean;
}

const sizeMap = {
  sm: 'max-w-[480px]',
  md: 'max-w-[640px]',
  lg: 'max-w-[900px]',
};

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  size = 'md',
  isOpen,
  onClose,
  onBack,
  withCloseButton = true,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[90dvh] flex-col overflow-hidden rounded-xl bg-white p-0 text-black shadow-lg',
          sizeMap[size]
        )}
      >
        {/* Header */}
        <div className="flex h-[64px] shrink-0 w-full items-center border-b border-iceberg-100 px-6">
          {/* Title + Back */}
          <div className="ml-auto flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="مرحله قبل"
                className="text-black transition-opacity hover:opacity-60"
              >
                <ArrowRight className="size-6" strokeWidth={1.5} />
              </button>
            )}

            <span className="text-lg font-medium">فعالسازی گارانتی</span>
          </div>

          {/* Close */}
          {withCloseButton && (
            <DialogClose asChild>
              <button
                type="button"
                aria-label="بستن"
                onClick={onClose}
                className="shrink-0 text-black transition-opacity hover:opacity-60"
              >
                <X className="size-7" strokeWidth={1.5} />
              </button>
            </DialogClose>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-6">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper;
