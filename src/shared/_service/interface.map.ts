// Provider-agnostic map/discovery contracts — ported from an internal
// infra-focused EV PWA spike (v5) that got the map/offline architecture
// right. Keep this file provider-agnostic: no OpenLayers/Neshan-specific
// types leak in here, only what the rest of the app needs to know about a
// position, a bounding box, and a marker.
export interface IMapPosition {
  lat: number;
  lng: number;
}

export interface IMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface IMapMarkerAppearance {
  iconUrl?: string;
  iconSize?: [number, number];
  anchor?: [number, number];
}

export interface IMapMarker {
  id: string | number;
  position: IMapPosition;
  appearance?: IMapMarkerAppearance;
}

export type NeshanMapType = 'neshan' | 'dreamy' | 'standard-day' | 'standard-night' | 'osm-bright';

export interface IMapConfig {
  provider: 'neshan';
  center: IMapPosition;
  zoom: number;
  neshan: { mapKey: string; mapType?: NeshanMapType; poi?: boolean; traffic?: boolean };
}

// Station/branch discovery is split into two query shapes on purpose:
//  - nearby: device GPS position + radius ("stations near me")
//  - viewport: map bounding box ("stations visible while browsing the map")
// A real charging network can have thousands of stations nationwide — never
// fetch all of them. See src/lib/stations/{nearby,viewport}.ts.
export interface INearbyStationQuery extends IMapPosition {
  radiusMeters: number;
  signal?: AbortSignal;
}

export interface IViewportStationQuery extends IMapBounds {
  zoom?: number;
  signal?: AbortSignal;
}
