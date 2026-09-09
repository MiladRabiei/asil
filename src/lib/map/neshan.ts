import { detectPlatform } from '@/lib/pwaInstall/detect';
import type { IMapPosition } from '@/shared/_service/interface.map';
import type { IMapProviderAdapter } from './provider';

// Navigation adapter only — map *rendering* lives in components/map/NeshanMap.
// Deep-link params confirmed against Neshan's official platform docs
// (platform.neshan.org/api) for the point/Android/web case; the iOS routing
// scheme below is not officially documented and should be smoke-tested on a
// real device before shipping (TODO(REQUIREMENT)).
export const neshanProvider: IMapProviderAdapter = {
  id: 'neshan',
  openNavigation(destination: IMapPosition, origin?: IMapPosition) {
    if (typeof window === 'undefined') return false;

    const destinationValue = `${destination.lat},${destination.lng}`;
    const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';

    if (detectPlatform() === 'ios') {
      window.location.href = `neshan://?destination=${destinationValue}${originParam}&vehicle=d`;
    } else {
      // Android + desktop: universal link, degrades to the Neshan website
      // when the app isn't installed — safe to always use.
      window.location.href = `https://nshn.ir/?destination=${encodeURIComponent(destinationValue)}${
        origin ? `&origin=${encodeURIComponent(`${origin.lat},${origin.lng}`)}` : ''
      }&vehicle=d`;
    }
    return true;
  },
};

export function openNeshanNavigation(destination: IMapPosition, origin?: IMapPosition) {
  return neshanProvider.openNavigation?.(destination, origin) ?? false;
}

// Point-only (no routing) deep link — e.g. a plain "view on map" action.
export function getNeshanPointUrl(position: IMapPosition): string {
  if (detectPlatform() === 'ios') return `neshan://?ll=${position.lat},${position.lng}`;
  return `https://nshn.ir/?lat=${position.lat}&lng=${position.lng}`;
}
