'use client';

import type { IMapPosition } from '@/shared/_service/interface.map';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UserLocationState {
  position: IMapPosition | null;
  accuracyMeters: number | null;
  heading: number | null;
  speedMetersPerSecond: number | null;
  loading: boolean;
  error: string | null;
}

const LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 15_000,
};

const UNSUPPORTED_MESSAGE = 'موقعیت مکانی توسط مرورگر پشتیبانی نمی‌شود.';

// GeolocationPositionError.message is the browser's own (English) string —
// e.g. "User denied Geolocation" — which doesn't belong in an otherwise
// fully-Persian UI. Map by .code instead so every failure path has a
// proper Persian message, and none of them silently fall back to English.
function localizeLocationError(reason: GeolocationPositionError): string {
  switch (reason.code) {
    case reason.PERMISSION_DENIED:
      return 'دسترسی به موقعیت مکانی رد شد. برای دیدن ایستگاه‌های نزدیک، دسترسی Location را در تنظیمات مرورگر فعال کنید.';
    case reason.POSITION_UNAVAILABLE:
      return 'موقعیت مکانی در حال حاضر در دسترس نیست. لطفاً دوباره تلاش کنید.';
    case reason.TIMEOUT:
      return 'دریافت موقعیت مکانی بیش از حد طول کشید. لطفاً دوباره تلاش کنید.';
    default:
      return 'دسترسی به موقعیت مکانی ممکن نشد.';
  }
}

export function useUserLocation(enabled = true) {
  const [state, setState] = useState<UserLocationState>({
    position: null,
    accuracyMeters: null,
    heading: null,
    speedMetersPerSecond: null,
    loading: enabled,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const applyPosition = useCallback((position: GeolocationPosition) => {
    const { coords } = position;

    setState((current) => ({
      ...current,
      position: {
        lat: coords.latitude,
        lng: coords.longitude,
      },
      accuracyMeters: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
      heading: Number.isFinite(coords.heading ?? NaN) ? coords.heading : null,
      speedMetersPerSecond: Number.isFinite(coords.speed ?? NaN) ? coords.speed : null,
      loading: false,
      error: null,
    }));
  }, []);

  const applyError = useCallback((reason: GeolocationPositionError) => {
    setState((current) => ({
      ...current,
      loading: false,
      error: localizeLocationError(reason),
    }));
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((current) => ({
        ...current,
        loading: false,
        error: UNSUPPORTED_MESSAGE,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(applyPosition, applyError, {
      ...LOCATION_OPTIONS,
      maximumAge: 0,
    });
  }, [applyError, applyPosition]);

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({
        ...current,
        loading: false,
      }));
      return;
    }

    if (!navigator.geolocation) {
      setState((current) => ({
        ...current,
        loading: false,
        error: UNSUPPORTED_MESSAGE,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      applyPosition,
      applyError,
      LOCATION_OPTIONS
    );

    // iOS/WebKit can suspend an active geolocation watch while the PWA is
    // backgrounded (tab switched, app minimized) and never resume it on its
    // own — a one-shot refresh when the page becomes visible again is what
    // actually recovers a live position instead of leaving the marker stale.
    // (watchPosition's own first callback already supplies the initial
    // position on mount — calling refresh() here too would just fire a
    // second, redundant getCurrentPosition request racing the first.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applyError, applyPosition, enabled, refresh]);

  return {
    ...state,
    refresh,
  };
}
