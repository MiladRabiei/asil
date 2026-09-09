'use client';
import { useEffect } from 'react';

// Tracks the on-screen keyboard's height via visualViewport and exposes it
// as CSS vars (--keyboard-inset, --viewport-height) so fixed bottom UI
// (manual-code-entry submit button, bottom nav) can stay above the keyboard
// instead of being covered by it — mainly an iOS Safari problem.
export function useViewportKeyboard() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const keyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`);
      document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);
}
