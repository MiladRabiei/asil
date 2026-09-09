import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeType = 'yellow' | 'gray' | 'purple' | 'orange' | 'white' | 'green';

export interface BadgeProps {
  type: BadgeType;
  children: React.ReactNode;
  badgeWidth?: string;
  className?: string;
}

const typeStyles: Record<BadgeType, string> = {
  yellow: 'bg-custom-yellow text-primary font-medium',
  gray: 'bg-custom-gray-300 text-custom-gray-500 font-bold',
  white: 'bg-white text-custom-gray-500 font-bold',
  purple: 'bg-custom-purple-light text-custom-gray-500 font-bold',
  orange: 'bg-custom-orange text-white font-bold',
  green: 'bg-custom-green text-custom-gray-500 font-bold',
};

const Badge: React.FC<BadgeProps> = ({ children, type, badgeWidth, className }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[10px] text-nowrap text-xs border-none outline-none p-md',
        typeStyles[type],
        badgeWidth,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Badge;
