'use client';

import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

const lock = () => {
  if (lockCount === 0) {
    const { body } = document;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalOverflow = body.style.overflow;
    originalPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      const currentPaddingRight = parseFloat(window.getComputedStyle(body).paddingRight || '0');
      body.style.paddingRight = `${currentPaddingRight + scrollBarWidth}px`;
    }
  }
  lockCount += 1;
};

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
};

const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    lock();
    return unlock;
  }, [isLocked]);
};

export default useLockBodyScroll;
