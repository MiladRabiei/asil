'use client';

import { useCallback, useState } from 'react';
import type { IMapPosition } from '@/shared/_service/interface.map';

export function useCurrentLocation() {
  const [position, setPosition] = useState<IMapPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude });
        setLoading(false);
      },
      (reason) => {
        setError(reason.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }, []);

  return { position, loading, error, getLocation };
}
