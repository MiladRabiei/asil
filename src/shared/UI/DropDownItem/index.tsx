'use client';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DropDownItemProps {
  title?: string;
  itemIcon?: StaticImageData | string;
  linkURL?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  onClick?: VoidFunction;
  isSelected?: boolean;
}

const DropDownItem: React.FC<DropDownItemProps> = ({
  title,
  itemIcon,
  linkURL,
  children,
  className,
  contentClassName,
  onClick,
  isSelected,
}) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(
        'bg-base-100 rounded-sm h-7 flex items-center justify-center cursor-pointer p-0',
        isSelected && 'bg-black/10 rounded-xl',
        className
      )}
    >
      {children ? (
        <div
          className={cn('flex justify-start gap-x-2 w-full h-full rounded-sm', contentClassName)}
        >
          {children}
        </div>
      ) : linkURL ? (
        <Link
          href={linkURL}
          className={cn('flex justify-start gap-x-2 w-full h-full rounded-sm', contentClassName)}
        >
          {itemIcon && <Image src={itemIcon} alt={title || ''} />}
          {title && <span className="text-sm font-semibold">{title}</span>}
        </Link>
      ) : (
        <div
          className={cn('flex justify-start gap-x-2 w-full h-full rounded-sm', contentClassName)}
        >
          {itemIcon && <Image src={itemIcon} alt={title || ''} />}
          {title && <span className="text-sm font-semibold">{title}</span>}
        </div>
      )}
    </DropdownMenuItem>
  );
};

export default DropDownItem;
