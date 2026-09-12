import { detectPlatform } from '@/lib/pwaInstall/detect';
import type { IMapPosition } from '@/shared/_service/interface.map';
import type { IMapProviderAdapter } from './provider';

/**
 * Neshan handoff contract:
 * Asil selects a station and opens it in Neshan. Asil does not request GPS
 * for this action, calculate a route, or start turn-by-turn navigation.
 * The user decides inside Neshan whether to tap Neshan's own navigation
 * control or return to Asil.
 */
export const neshanProvider: IMapProviderAdapter = {
  id: 'neshan',

  openLocation(position: IMapPosition) {
    if (typeof window === 'undefined' || !isValidPosition(position)) return false;
    window.location.assign(getNeshanPointUrl(position));
    return true;
  },

  openNavigation(destination: IMapPosition, origin?: IMapPosition) {
    if (typeof window === 'undefined' || !isValidPosition(destination)) return false;

    const destinationValue = `${destination.lat},${destination.lng}`;
    const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';

    if (detectPlatform() === 'ios') {
      window.location.href = `neshan://?destination=${destinationValue}${originParam}&vehicle=d`;
    } else {
      window.location.href = `https://nshn.ir/?destination=${encodeURIComponent(destinationValue)}${
        origin ? `&origin=${encodeURIComponent(`${origin.lat},${origin.lng}`)}` : ''
      }&vehicle=d`;
    }
    return true;
  },
};

function isValidPosition(position: IMapPosition): boolean {
  return (
    Number.isFinite(position.lat) &&
    Number.isFinite(position.lng) &&
    position.lat >= -90 &&
    position.lat <= 90 &&
    position.lng >= -180 &&
    position.lng <= 180
  );
}

export function openNeshanLocation(position: IMapPosition) {
  return neshanProvider.openLocation?.(position) ?? false;
}

export function openNeshanNavigation(destination: IMapPosition, origin?: IMapPosition) {
  return neshanProvider.openNavigation?.(destination, origin) ?? false;
}

// Point-only handoff — Neshan owns the place UI and any subsequent routing.
export function getNeshanPointUrl(position: IMapPosition): string {
  if (detectPlatform() === 'ios') return `neshan://?ll=${position.lat},${position.lng}`;
  return `https://nshn.ir/?lat=${position.lat}&lng=${position.lng}`;
}
