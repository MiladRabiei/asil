'use client';

import { mapConfig } from '@/config/map.config';
import { useUserLocation } from '@/lib/geolocation';
import { useNearbyStations, useViewportStations } from '@/lib/stations';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import type {
  IMapBounds,
  IMapMarker,
  IViewportStationQuery,
} from '@/shared/_service/interface.map';
import { useCallback, useMemo, useState } from 'react';
import BranchPopup from './BranchPopup';
import { NeshanMap } from './Map';

const STATUS_ICON: Record<IChargingBranch['status'], string> = {
  AVAILABLE: '/icons/marker-available.svg',
  FULL: '/icons/marker-full.svg',
  OUT_OF_SERVICE: '/icons/marker-offline.svg',
};

/**
 * User-facing map flow combines two discovery modes, deliberately kept
 * separate (see src/lib/stations):
 *  - nearby: GPS + radius — what centers the map on open and answers
 *    "what's around me right now" fast, without waiting on a pan.
 *  - viewport: map bounds — what takes over once the user pans/zooms away
 *    from their own position, so browsing stations in another city (e.g.
 *    planning a trip) actually shows something instead of an empty map.
 * Results are unioned by id — a station can appear via either query without
 * being duplicated on the map.
 */
export default function BranchMap() {
  const {
    position,
    accuracyMeters,
    loading: locating,
    error: locationError,
    refresh,
  } = useUserLocation();
  const { data: nearbyBranches, loading: loadingNearby, offline } = useNearbyStations(position);

  const [viewport, setViewport] = useState<IViewportStationQuery | null>(null);
  const { data: viewportBranches, loading: loadingViewport } = useViewportStations(viewport);

  const branches = useMemo(() => {
    const byId = new Map<string, IChargingBranch>();
    for (const branch of nearbyBranches) byId.set(String(branch.id), branch);
    for (const branch of viewportBranches) byId.set(String(branch.id), branch);
    return [...byId.values()];
  }, [nearbyBranches, viewportBranches]);

  const onViewportChange = useCallback((bounds: IMapBounds, zoom: number) => {
    setViewport({ ...bounds, zoom });
  }, []);

  const markers: IMapMarker[] = branches.map((branch) => ({
    id: branch.id,
    position: branch.position,
    appearance: { iconUrl: STATUS_ICON[branch.status], anchor: [0.5, 1] },
  }));

  const handleLocateUser = useCallback(() => refresh(), [refresh]);
  const loading = loadingNearby || loadingViewport;

  return (
    <div className="relative h-full w-full">
      <NeshanMap
        center={position ?? mapConfig.center}
        zoom={position ? Math.max(mapConfig.zoom, 15) : mapConfig.zoom}
        mapKey={mapConfig.neshan.mapKey}
        mapType={mapConfig.neshan.mapType}
        poi={mapConfig.neshan.poi}
        traffic={mapConfig.neshan.traffic}
        markers={markers}
        userPosition={position}
        userAccuracyMeters={accuracyMeters}
        onLocateUser={handleLocateUser}
        locatingUser={locating}
        onViewportChange={onViewportChange}
        renderMarkerPopup={(marker, close) => {
          const branch = branches.find((item) => String(item.id) === String(marker.id));
          return branch ? <BranchPopup branch={branch} onClose={close} /> : null;
        }}
      />
      {locating && !position && (
        <div className="absolute top-3 right-1/2 z-20 translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs shadow">
          در حال دریافت موقعیت شما…
        </div>
      )}
      {locationError && !position && (
        <div className="absolute top-3 right-1/2 z-20 max-w-[90%] translate-x-1/2 rounded-lg bg-background/95 px-3 py-2 text-center text-xs text-destructive shadow">
          دسترسی به موقعیت مکانی ممکن نیست. برای دیدن ایستگاه‌های نزدیک، دسترسی Location را فعال
          کنید — نقشه همچنان با جابه‌جایی قابل مرور است.
        </div>
      )}
      {loading && (
        <div className="absolute top-3 right-1/2 z-20 translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs shadow">
          در حال بارگذاری ایستگاه‌ها…
        </div>
      )}
      {offline && !loading && (
        <div className="absolute top-3 right-1/2 z-20 translate-x-1/2 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 shadow">
          حالت آفلاین — نمایش آخرین اطلاعات ذخیره‌شده
        </div>
      )}
    </div>
  );
}
