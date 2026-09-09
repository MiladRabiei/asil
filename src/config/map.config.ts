import type { IMapConfig } from '@/shared/_service/interface.map';

// Single source of truth for map defaults — components/config read this
// instead of process.env directly, so a non-Neshan provider (if ever added)
// only needs a new branch here, not scattered env lookups.
export const mapConfig: IMapConfig = {
  provider: 'neshan',
  center: {
    lat: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT || 35.6892),
    lng: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG || 51.389),
  },
  zoom: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || 12),
  neshan: {
    mapKey: process.env.NEXT_PUBLIC_NESHAN_MAP_KEY || '',
    mapType:
      (process.env.NEXT_PUBLIC_NESHAN_MAP_TYPE as IMapConfig['neshan']['mapType']) || 'neshan',
    poi: process.env.NEXT_PUBLIC_NESHAN_POI !== 'false',
    traffic: process.env.NEXT_PUBLIC_NESHAN_TRAFFIC === 'true',
  },
};
