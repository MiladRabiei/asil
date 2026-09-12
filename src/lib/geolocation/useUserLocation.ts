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
      error: reason.message,
    }));
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((current) => ({
        ...current,
        loading: false,
        error: 'موقعیت مکانی توسط مرورگر پشتیبانی نمی‌شود.',
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
        error: 'موقعیت مکانی توسط مرورگر پشتیبانی نمی‌شود.',
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

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, applyError, applyPosition]);

  return {
    ...state,
    refresh,
  };
}
