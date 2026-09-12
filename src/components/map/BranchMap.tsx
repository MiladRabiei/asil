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
 * Combines two station-discovery modes:
 *
 * 1. Nearby:
 *    GPS + radius.
 *    Used for stations around the user's current position.
 *
 * 2. Viewport:
 *    Map bounds + zoom.
 *    Used when the user moves the map to another area.
 *
 * Results are merged by station id so a station returned by both
 * queries appears only once.
 */
export default function BranchMap() {
  const {
    position,
    accuracyMeters,
    loading: locating,
    error: locationError,
    refresh,
  } = useUserLocation();

  const handleLocateUser = useCallback(() => {
    refresh();
  }, [refresh]);

  const { data: nearbyBranches, loading: loadingNearby, offline } = useNearbyStations(position);

  const [viewport, setViewport] = useState<IViewportStationQuery | null>(null);

  const { data: viewportBranches, loading: loadingViewport } = useViewportStations(viewport);

  /**
   * Merge nearby + viewport results.
   *
   * Station id is the source of truth for deduplication.
   */
  const branches = useMemo(() => {
    const byId = new Map<string, IChargingBranch>();

    for (const branch of nearbyBranches) {
      byId.set(String(branch.id), branch);
    }

    for (const branch of viewportBranches) {
      byId.set(String(branch.id), branch);
    }

    return [...byId.values()];
  }, [nearbyBranches, viewportBranches]);

  /**
   * Neshan reports the current map bounds and zoom after
   * the viewport changes.
   */
  const onViewportChange = useCallback((bounds: IMapBounds, zoom: number) => {
    setViewport({
      ...bounds,
      zoom,
    });
  }, []);

  const markers: IMapMarker[] = useMemo(
    () =>
      branches.map((branch) => ({
        id: branch.id,
        position: branch.position,
        appearance: {
          iconUrl: STATUS_ICON[branch.status],
          anchor: [0.5, 1],
        },
      })),
    [branches]
  );

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

          if (!branch) {
            return null;
          }

          return <BranchPopup branch={branch} onClose={close} />;
        }}
      />

      {/* Native browser location request is still in progress. */}
      {locating && !position && (
        <div className="absolute top-3 right-1/2 z-20 translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs shadow">
          در حال دریافت موقعیت شما…
        </div>
      )}

      {/*
       * IMPORTANT:
       *
       * This is NOT a permission prompt.
       *
       * The browser handles the native Location permission dialog.
       * This message is shown only after the browser API reports
       * an error.
       */}
      {locationError && !position && !locating && (
        <div className="absolute top-3 right-1/2 z-20 max-w-[90%] translate-x-1/2 rounded-lg bg-background/95 px-3 py-2 text-center text-xs text-destructive shadow">
          <p>{locationError}</p>

          <button
            type="button"
            onClick={handleLocateUser}
            className="mt-2 rounded-md px-3 py-1 text-xs font-medium text-primary hover:bg-muted"
          >
            تلاش دوباره
          </button>
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
