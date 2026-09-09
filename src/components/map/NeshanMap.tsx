'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import NeshanMapLib, { type NeshanMapRef } from '@neshan-maps-platform/react-openlayers';

import Feature from '@neshan-maps-platform/ol/Feature';
import MapBrowserEvent from '@neshan-maps-platform/ol/MapBrowserEvent';
import Overlay from '@neshan-maps-platform/ol/Overlay';
import CircleGeom from '@neshan-maps-platform/ol/geom/Circle';
import Point from '@neshan-maps-platform/ol/geom/Point';
import VectorLayer from '@neshan-maps-platform/ol/layer/Vector';
import { fromLonLat, toLonLat } from '@neshan-maps-platform/ol/proj';
import VectorSource from '@neshan-maps-platform/ol/source/Vector';
import CircleStyle from '@neshan-maps-platform/ol/style/Circle';
import Fill from '@neshan-maps-platform/ol/style/Fill';
import Icon from '@neshan-maps-platform/ol/style/Icon';
import Stroke from '@neshan-maps-platform/ol/style/Stroke';
import Style from '@neshan-maps-platform/ol/style/Style';

import type {
  IMapBounds,
  IMapMarker,
  IMapPosition,
  NeshanMapType,
} from '@/shared/_service/interface.map';

export interface NeshanMapProps {
  center: IMapPosition;
  zoom: number;
  mapKey: string;
  mapType?: NeshanMapType;
  poi?: boolean;
  traffic?: boolean;
  markers?: IMapMarker[];
  className?: string;
  style?: React.CSSProperties;
  onMarkerClick?: (marker: IMapMarker) => void;
  onViewportChange?: (bounds: IMapBounds, zoom: number) => void;
  renderMarkerPopup?: (marker: IMapMarker, close: () => void) => React.ReactNode;
  getMarkerAppearance?: (marker: IMapMarker) => IMapMarker['appearance'];
  userPosition?: IMapPosition | null;
  userAccuracyMeters?: number | null;
  onLocateUser?: () => void;
  locatingUser?: boolean;
}

function createMarkerLayer(
  markers: IMapMarker[],
  getMarkerAppearance?: NeshanMapProps['getMarkerAppearance']
) {
  const source = new VectorSource();

  for (const marker of markers) {
    const appearance = getMarkerAppearance?.(marker) ?? marker.appearance;

    const feature = new Feature({
      geometry: new Point(fromLonLat([marker.position.lng, marker.position.lat])),
      markerId: String(marker.id),
    });

    if (appearance?.iconUrl) {
      feature.setStyle(
        new Style({
          image: new Icon({
            src: appearance.iconUrl,
            anchor: appearance.anchor ?? [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            ...(appearance.iconSize
              ? {
                  scale: appearance.iconSize[0] / 32,
                }
              : {}),
          }),
        })
      );
    } else {
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({
              color: '#16a34a',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
          }),
        })
      );
    }

    source.addFeature(feature);
  }

  return new VectorLayer({
    source,
  });
}

export default function NeshanMapView({
  center,
  zoom,
  mapKey,
  mapType = 'neshan',
  poi = true,
  traffic = false,
  markers = [],
  className,
  style,
  onMarkerClick,
  onViewportChange,
  renderMarkerPopup,
  getMarkerAppearance,
  userPosition = null,
  userAccuracyMeters = null,
  onLocateUser,
  locatingUser = false,
}: NeshanMapProps) {
  const mapRef = useRef<NeshanMapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  /**
   * IMPORTANT:
   * This is populated by Neshan's onInit callback.
   * Do not rely on mapRef.current?.map inside mount effects.
   */
  const [map, setMap] = useState<NeshanMapRef['map'] | null>(null);

  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const userLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const markersRef = useRef(markers);
  const markerClickRef = useRef(onMarkerClick);
  const viewportRef = useRef(onViewportChange);

  const [selectedMarker, setSelectedMarker] = useState<IMapMarker | null>(null);

  const didCenterOnInitialLocationRef = useRef(false);

  const [popupElement] = useState<HTMLDivElement | null>(() =>
    typeof document === 'undefined' ? null : document.createElement('div')
  );

  /**
   * Keep refs synchronized with the latest props.
   */
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    markerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    viewportRef.current = onViewportChange;
  }, [onViewportChange]);

  /**
   * If the selected marker disappears from the current marker list,
   * close its popup.
   */
  useEffect(() => {
    if (
      selectedMarker &&
      !markers.some((marker) => String(marker.id) === String(selectedMarker.id))
    ) {
      setSelectedMarker(null);
    }
  }, [markers, selectedMarker]);

  /**
   * ------------------------------------------------------------
   * MARKERS
   * ------------------------------------------------------------
   *
   * This effect now waits for `map`.
   * `map` comes from Neshan's `onInit`.
   */
  useEffect(() => {
    if (!map) return;

    const layer = createMarkerLayer(markers, getMarkerAppearance);

    map.addLayer(layer);
    markerLayerRef.current = layer;

    return () => {
      map.removeLayer(layer);

      if (markerLayerRef.current === layer) {
        markerLayerRef.current = null;
      }
    };
  }, [map, markers, getMarkerAppearance]);

  /**
   * ------------------------------------------------------------
   * CONTAINER RESIZE
   * ------------------------------------------------------------
   * The SDK does not observe its own container — checked its compiled
   * source directly, there is no ResizeObserver or updateSize() call
   * anywhere in it. OpenLayers measures the container's pixel size once,
   * at construction time, and never again on its own. If that measurement
   * happens to land at 0x0 (a CSS height chain not fully resolved yet,
   * the mobile bottom nav mounting a frame later, a sidebar animating,
   * an orientation change, ...), the map is stuck rendering nothing until
   * something explicitly tells it to re-measure. This is exactly the
   * "container's width or height are 0" warning — updateSize() is that
   * explicit re-measure, called once map exists and again on every future
   * resize of this specific element (not just window resize, so a sidebar
   * toggle or nav bar appearing also triggers it).
   */
  useEffect(() => {
    if (!map || !containerRef.current) return;
    map.updateSize();
    const observer = new ResizeObserver(() => map.updateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [map]);

  /**
   * ------------------------------------------------------------
   * MAP EVENTS
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!map) return;

    const clickHandler = (event: MapBrowserEvent<MouseEvent>) => {
      let clickedFeature: Feature | undefined;

      map.forEachFeatureAtPixel(
        event.pixel,
        (candidate: Feature) => {
          clickedFeature = candidate;
          return candidate;
        },
        {}
      );

      if (!clickedFeature) {
        setSelectedMarker(null);
        return;
      }

      const markerId = clickedFeature.get('markerId');

      if (markerId == null) {
        return;
      }

      const marker = markersRef.current.find((item) => String(item.id) === String(markerId));

      if (!marker) return;

      setSelectedMarker(marker);
      markerClickRef.current?.(marker);
    };

    const emitViewport = () => {
      const callback = viewportRef.current;

      if (!callback) return;

      const view = map.getView();
      const size = map.getSize();

      if (!view || !size) return;

      const extent = view.calculateExtent(size);

      if (!extent) return;

      const [west, south] = toLonLat([extent[0], extent[1]]);

      const [east, north] = toLonLat([extent[2], extent[3]]);

      callback(
        {
          north,
          south,
          east,
          west,
        },
        Number(view.getZoom() ?? 0)
      );
    };

    const moveStartHandler = () => {
      setSelectedMarker(null);
    };

    map.on('click', clickHandler);
    map.on('moveend', emitViewport);
    map.on('movestart', moveStartHandler);

    /**
     * Emit initial viewport after the map has initialized.
     */
    const timer = window.setTimeout(emitViewport, 0);

    return () => {
      window.clearTimeout(timer);

      map.un('click', clickHandler);
      map.un('moveend', emitViewport);
      map.un('movestart', moveStartHandler);
    };
  }, [map]);

  /**
   * ------------------------------------------------------------
   * CENTER ON USER
   * ------------------------------------------------------------
   */
  const centerOnUser = useCallback(() => {
    if (!map || !userPosition) return;

    const view = map.getView();

    view.animate({
      center: fromLonLat([userPosition.lng, userPosition.lat]),
      zoom: Math.max(Number(view.getZoom() ?? zoom), 15),
      duration: 350,
    });
  }, [map, userPosition, zoom]);

  /**
   * Center on the first GPS position only.
   */
  useEffect(() => {
    if (!map || !userPosition || didCenterOnInitialLocationRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      centerOnUser();
      didCenterOnInitialLocationRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [map, centerOnUser, userPosition]);

  /**
   * ------------------------------------------------------------
   * USER LOCATION LAYER
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!map) return;

    if (!userPosition) {
      if (userLayerRef.current) {
        map.removeLayer(userLayerRef.current);
        userLayerRef.current = null;
      }

      return;
    }

    const source = new VectorSource();

    const projectedPosition = fromLonLat([userPosition.lng, userPosition.lat]);

    /**
     * User position.
     */
    const positionFeature = new Feature({
      geometry: new Point(projectedPosition),
    });

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: '#2563eb',
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3,
          }),
        }),
      })
    );

    source.addFeature(positionFeature);

    /**
     * Accuracy circle.
     */
    if (userAccuracyMeters && userAccuracyMeters > 0) {
      const accuracyFeature = new Feature({
        geometry: new CircleGeom(projectedPosition, userAccuracyMeters),
      });

      accuracyFeature.setStyle(
        new Style({
          fill: new Fill({
            color: 'rgba(37, 99, 235, 0.12)',
          }),
          stroke: new Stroke({
            color: 'rgba(37, 99, 235, 0.35)',
            width: 1,
          }),
        })
      );

      source.addFeature(accuracyFeature);
    }

    const layer = new VectorLayer({
      source,
      zIndex: 1000,
    });

    map.addLayer(layer);
    userLayerRef.current = layer;

    return () => {
      map.removeLayer(layer);

      if (userLayerRef.current === layer) {
        userLayerRef.current = null;
      }
    };
  }, [map, userPosition, userAccuracyMeters]);

  /**
   * ------------------------------------------------------------
   * POPUP
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!map || !popupElement) return;

    const overlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: true,
      autoPan: {
        animation: {
          duration: 200,
        },
      },
      offset: [0, -12],
    });

    map.addOverlay(overlay);

    if (selectedMarker) {
      overlay.setPosition(fromLonLat([selectedMarker.position.lng, selectedMarker.position.lat]));
    } else {
      overlay.setPosition(undefined);
    }

    return () => {
      map.removeOverlay(overlay);
    };
  }, [map, selectedMarker, popupElement]);

  const popupContent = useMemo(() => {
    if (!selectedMarker || !renderMarkerPopup) {
      return null;
    }

    return renderMarkerPopup(selectedMarker, () => setSelectedMarker(null));
  }, [selectedMarker, renderMarkerPopup]);

  /**
   * ------------------------------------------------------------
   * MAP KEY FALLBACK
   * ------------------------------------------------------------
   */
  if (!mapKey) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
        کلید نقشه نشان تنظیم نشده است (NEXT_PUBLIC_NESHAN_MAP_KEY).
      </div>
    );
  }

  return (
    // The bug this was hit by: `min-h-screen` sets min-height, not height.
    // A percentage-height child (NeshanMapLib's `h-full` below) can only
    // resolve against a parent with a *definite* height — min-height does
    // not make a height definite, so the child was computing to 0 and
    // OpenLayers measured a 0x0 container at construction time. The inline
    // style below is a hard, unconditional 100%/100% — not overridable by
    // a caller's className the way min-h-screen was — and still merges any
    // `style` the caller passes for further customization.
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    >
      <NeshanMapLib
        ref={mapRef}
        mapKey={mapKey}
        defaultType={mapType}
        center={{
          latitude: center.lat,
          longitude: center.lng,
        }}
        zoom={zoom}
        poi={poi}
        traffic={traffic}
        onInit={(initializedMap) => {
          setMap(initializedMap);
        }}
        style={{ width: '100%', height: '100%' }}
      />

      {popupElement && createPortal(popupContent, popupElement)}

      <button
        type="button"
        onClick={() => {
          onLocateUser?.();

          if (userPosition) {
            centerOnUser();
          }
        }}
        disabled={locatingUser}
        aria-label="نمایش موقعیت من"
        title="موقعیت من"
        className="absolute bottom-5 left-4 z-20 flex size-11 items-center justify-center rounded-full border border-border-primary bg-background/95 text-xl shadow-lg backdrop-blur disabled:opacity-60"
      >
        {locatingUser ? '…' : '⌖'}
      </button>
    </div>
  );
}
