'use client';
import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface DropDownProps {
  textClass?: string;
  dropDownSize?: string;
  title: string;
  dropDownIconCloseMode: StaticImageData | string;
  dropDownIconOpenMode?: StaticImageData | string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const DropDown: React.FC<DropDownProps> = ({
  title,
  textClass,
  dropDownSize,
  dropDownIconCloseMode,
  dropDownIconOpenMode,
  children,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        disabled={disabled}
        className={cn(
          'btn h-10 lg:h-12 shrink-0 shadow-none outline-none',
          isOpen && 'rounded-b-none',
          dropDownSize
        )}
      >
        <Image
          src={isOpen ? dropDownIconOpenMode || dropDownIconCloseMode : dropDownIconCloseMode}
          alt={title || 'بستن'}
        />
        <span className={cn('text-xs xl:text-sm flex items-center justify-center', textClass)}>
          {title}
        </span>
      </DropdownMenuTrigger>

      {children && (
        <DropdownMenuContent
          align="start"
          sideOffset={0}
          className={cn(
            'bg-neutral min-w-max w-full space-y-2 p-1 z-50',
            isOpen && 'rounded-t-none rounded-b-xs'
          )}
        >
          {children}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default DropDown;
