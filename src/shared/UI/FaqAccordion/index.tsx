'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import Button from '@/shared/UI/Button';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export interface IAccordionContent {
  title: string;
  description: string;
}

export interface FaqAccordionProps {
  accordionName?: string;
  accordionsContent: IAccordionContent[];
  initialCount?: number;
}

const FaqAccordion = ({
  accordionName,
  accordionsContent,
  initialCount = 3,
}: FaqAccordionProps) => {
  const [showAll, setShowAll] = useState(false);
  const [openItem, setOpenItem] = useState<string>('');

  const visibleItems = showAll ? accordionsContent : accordionsContent.slice(0, initialCount);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative w-full">
        <Accordion
          key={accordionName}
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className="flex w-full flex-col divide-y divide-border gap-md"
        >
          {visibleItems.map((item, index) => {
            const value = `faq-${index}`;
            const isOpen = openItem === value;

            return (
              <AccordionItem
                key={value}
                value={value}
                className="w-full border-none bg-surface-neutral p-md rounded-2xl"
              >
                <AccordionTrigger
                  className={cn(
                    'flex w-full items-center gap-4',
                    'text-right text-sm font-medium',
                    'md:text-base lg:text-lg',
                    'hover:no-underline',
                    'border-0',
                    // Hide any icon the base AccordionTrigger renders on its own
                    // (e.g. a default ChevronDown), except our own icon below.
                    '[&_svg:not([data-faq-icon])]:hidden'
                  )}
                >
                  {/* Question */}
                  <span className="min-w-0 flex-1 text-start leading-7">{item.title}</span>
                  {/* Icon */}
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    {isOpen ? (
                      <X data-faq-icon className="size-5" />
                    ) : (
                      <Plus data-faq-icon className="size-5" />
                    )}
                  </span>
                </AccordionTrigger>

                <AccordionContent
                  className="
                  py-md
                    text-right
                    text-sm
                    lg:text-base
                    font-medium
                    leading-7
                    lg:lrading-8
                  "
                >
                  {item.description}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {!showAll && accordionsContent.length > initialCount && (
          <div
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0
              h-28
              bg-gradient-to-t
              from-background
              via-background/80
              to-transparent
            "
          />
        )}
      </div>

      {accordionsContent.length > initialCount && (
        <Button
          type="button"
          variant="plain"
          onClick={() => setShowAll((prev) => !prev)}
          className="
            h-11
            w-40
            rounded-full
            border
            border-primary
            bg-white
            text-sm
            font-medium
            text-primary
            hover:bg-primary/5
          "
        >
          {showAll ? 'بستن' : 'نمایش همه'}
        </Button>
      )}
    </div>
  );
};

export default FaqAccordion;
