'use client';

import { Button } from '@/components/ui/button';
import { ChevronRightIcon, XIcon } from 'lucide-react';
import React from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { Calendar } from 'react-multi-date-picker';

export interface JalaliDatePickerViewProps {
  title: string;
  value: DateObject | null;
  mode: 'drawer' | 'popover';
  onClose: () => void;
  onBack: () => void;
  onSubmit: (date: DateObject) => void;
}
const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const JalaliDatePickerView: React.FC<JalaliDatePickerViewProps> = ({
  title,
  value,
  mode,
  onClose,
  onBack,
  onSubmit,
}) => {
  const [pendingDate, setPendingDate] = React.useState<DateObject | null>(value);

  return (
    <div className="flex flex-col gap-md w-full">
      <div className="flex items-center justify-between">
        {mode === 'popover' ? (
          <button onClick={onBack} className="flex items-center gap-sm">
            <ChevronRightIcon className="size-4 " />
            <span className="text-sm font-medium">{title}</span>
          </button>
        ) : (
          <>
            <h2 className="text-base font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="p-1">
              <XIcon className="size-5 text-muted-foreground" />
            </button>
          </>
        )}
      </div>

      <Calendar
        calendar={persian}
        locale={persian_fa}
        value={pendingDate}
        weekDays={WEEK_DAYS}
        shadow={false}
        className="w-full"
        onChange={(d) => setPendingDate(d as DateObject)}
      />

      <div className="mt-md flex gap-sm justify-end">
        {mode === 'drawer' && (
          <Button
            className="h-10 rounded-3xl min-w-31 flex-1 border border-blue-500! text-blue-500"
            variant="plain"
            onClick={onBack}
          >
            بازگشت
          </Button>
        )}
        <Button
          className="h-10 rounded-3xl min-w-31 flex-1"
          variant="secondary"
          disabled={!pendingDate}
          onClick={() => pendingDate && onSubmit(pendingDate)}
        >
          ثبت
        </Button>
      </div>
    </div>
  );
};

export default JalaliDatePickerView;
