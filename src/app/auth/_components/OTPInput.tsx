'use client';

import { cn } from '@/lib/utils';
import React, { ChangeEvent, KeyboardEvent, useRef } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 6, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.replace(/\D/g, '');
    if (newValue.length > 1) return;

    const newOTP = value.split('');
    newOTP[index] = newValue;
    const updatedOTP = newOTP.join('');
    onChange(updatedOTP);

    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleClick = () => {
    const firstEmptyIndex = value.split('').findIndex((char) => !char);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-row-reverse justify-center gap-1 md:gap-sm" dir="rtl">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el: HTMLInputElement | null): void => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={handleClick}
            aria-invalid={!!error}
            className={cn(
              'h-12 w-12 rounded-xl border-0 bg-surface-neutral text-center text-base font-semibold text-foreground',
              'outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
              error && 'ring-1 ring-destructive'
            )}
            style={{ caretColor: 'transparent' }}
          />
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default OTPInput;
