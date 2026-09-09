'use client';
import React, { ReactNode, useState } from 'react';
import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleProps {
  children: ReactNode;
  header: ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  defaultOpen?: boolean;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  header,
  headerClassName,
  bodyClassName,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <ShadcnCollapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('w-full flex flex-col gap-2', bodyClassName)}
    >
      <CollapsibleTrigger
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-xl font-medium',
          'bg-base-300 border border-base-300 rounded-lg',
          'hover:bg-base-200 transition-colors',
          headerClassName
        )}
      >
        {header}
        <ChevronDown
          className={cn('size-5 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 py-2">{children}</CollapsibleContent>
    </ShadcnCollapsible>
  );
};

export default Collapsible;
