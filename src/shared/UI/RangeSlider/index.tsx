'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { convertToLatinDigits } from '@/shared/utils/digitConvertor.utils';

export interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  onMinChange,
  onMaxChange,
}) => {
  const formatPersianNumber = (value: number) => value.toLocaleString('fa-IR');

  const handleSliderChange = (values: number[]) => {
    const [newMin, newMax] = values;
    if (newMin !== minValue) onMinChange(newMin);
    if (newMax !== maxValue) onMaxChange(newMax);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = convertToLatinDigits(e.target.value).replace(/\D/g, '');
    onMinChange(raw ? Number(raw) : min);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = convertToLatinDigits(e.target.value).replace(/\D/g, '');
    onMaxChange(raw ? Number(raw) : max);
  };

  const handleMinBlur = () => {
    const clamped = Math.max(min, Math.min(minValue, maxValue - step));
    onMinChange(clamped);
  };

  const handleMaxBlur = () => {
    const clamped = Math.max(minValue + step, Math.min(maxValue, max));
    onMaxChange(clamped);
  };

  return (
    <div className="flex flex-col gap-md w-full px-sm" dir="rtl">
      {/* Inputs */}
      <div className="flex flex-col gap-md text-sm text-base-content">
        {/* MIN */}
        <div className="flex items-center gap-md w-full border-b border-gray-300">
          <span className="text-xs text-base-content/60 shrink-0">از</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatPersianNumber(minValue)}
            onChange={handleMinInputChange}
            onBlur={handleMinBlur}
            className="flex-1 text-center bg-transparent outline-none border-none appearance-none"
          />
          <span className="text-xs text-base-content/60 shrink-0">تومان</span>
        </div>

        {/* MAX */}
        <div className="flex items-center gap-md w-full border-b border-gray-300">
          <span className="text-xs text-base-content/60 shrink-0">تا</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatPersianNumber(maxValue)}
            onChange={handleMaxInputChange}
            onBlur={handleMaxBlur}
            className="flex-1 text-center bg-transparent outline-none border-none appearance-none"
          />
          <span className="text-xs text-base-content/60 shrink-0">تومان</span>
        </div>
      </div>

      {/* SLIDER */}
      <div dir="ltr">
        <Slider
          min={min}
          max={max}
          step={step}
          value={[minValue, maxValue]}
          onValueChange={handleSliderChange}
          dir="rtl"
          className="w-full"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-base-content/50">
        <span>ارزان‌ترین</span>
        <span>گران‌ترین</span>
      </div>
    </div>
  );
};

export default RangeSlider;
