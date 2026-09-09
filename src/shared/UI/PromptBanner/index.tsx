'use client';

import React from 'react';

export interface PromptBannerProps {
  children: React.ReactNode;
  onDismiss?: () => void;
}

// Fixed bottom banner, above safe-area-inset (iPhone home indicator),
// non-blocking — the page underneath stays fully usable. This is the right
// pattern for "soft ask" prompts (install / enable notifications); use
// ModalWrapper instead for anything that must block interaction.
export function PromptBanner({ children, onDismiss }: PromptBannerProps) {
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md items-center justify-between gap-sm rounded-t-2xl bg-white p-md shadow-lg"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="بستن" className="btn btn-sm btn-circle btn-ghost">
          ✕
        </button>
      )}
    </div>
  );
}
