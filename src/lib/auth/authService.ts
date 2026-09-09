import { refreshTokenPersister, tokenPersister } from '@/lib/persisters/tokenPersister';

class AuthService {
  private listeners: ((token: string | null) => void)[] = [];

  getToken(): string | null {
    return tokenPersister.get() || null;
  }

  setToken(token: string): void {
    tokenPersister.set(token);
    this.notify(token);
  }

  deleteToken(): void {
    tokenPersister.delete();
    this.notify(null);
  }

  getRefreshToken(): string | null {
    return refreshTokenPersister?.get?.() || null; // safe even if persister missing
  }

  setRefreshToken(token: string): void {
    refreshTokenPersister?.set?.(token);
  }

  deleteRefreshToken(): void {
    refreshTokenPersister?.delete?.();
  }

  // refreshToken is now optional
  setSession(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
  }

  clearSession(): void {
    this.deleteToken();
    this.deleteRefreshToken();
  }

  subscribe(listener: (token: string | null) => void): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (token: string | null) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notify(token: string | null) {
    this.listeners.forEach((l) => l(token));
  }
}

export default new AuthService();
