import { IInstallPlatformType } from '@/shared/_service/interface.schema';

// iOS Safari's non-standard flag and IE/Edge legacy detection property —
// neither is in the standard lib.dom.d.ts typings, so we extend narrowly
// instead of reaching for `any`.
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}
interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

export function detectPlatform(): IInstallPlatformType {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as WindowWithMSStream).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Macintosh|Windows|Linux/.test(ua)) return 'desktop';
  return 'unknown';
}
