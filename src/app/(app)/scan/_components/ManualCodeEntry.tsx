'use client';

import Button from '@/shared/UI/Button';
import TextInput from '@/shared/UI/TextInput';
import { convertToLatinDigits } from '@/shared/utils/digitConvertor.utils';
import { useState } from 'react';

export interface ManualCodeEntryProps {
  onSubmit: (code: string) => void;
}

// Fallback for when the camera isn't available/permitted, or the QR on the
// device is worn off — the device code is printed on every charging unit
// (see IChargingBranch.deviceCode).
export default function ManualCodeEntry({ onSubmit }: ManualCodeEntryProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-sm w-full max-w-sm mx-auto rounded-2xl bg-white p-md text-foreground"
    >
      <TextInput
        id="device-code"
        name="device-code"
        type="text"
        label="کد دستگاه شارژ"
        placeholder="مثلاً EVB-0001"
        value={code}
        onChange={(e) => setCode(convertToLatinDigits(e.target.value))}
      />
      <Button type="submit" disabled={!code.trim()}>
        تایید کد
      </Button>
    </form>
  );
}
