import { IInstallPlatformType } from '@/shared/_service/interface.schema';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

export function detectPlatform(): IInstallPlatformType {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua) && !(window as WindowWithMSStream).MSStream) {
    return 'ios';
  }

  // iPadOS 13+ Safari uses a Macintosh UA by default.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) {
    return 'ios';
  }

  if (/Android/.test(ua)) {
    return 'android';
  }

  if (/Macintosh|Windows|Linux/.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}
