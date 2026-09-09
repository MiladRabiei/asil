'use client';

import authService from '@/lib/auth/authService';
import { refreshTokens } from '@/lib/axiosInstance';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface IAuthContext {
  isAuthenticated: boolean;
  token: string | null;
  initializing: boolean;
  refreshToken: string | null;
  isReconnecting: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: (navigateRoute?: string) => void;
  isLoggingOut: () => boolean;
}

const AuthContext = createContext<IAuthContext>({
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  initializing: true,
  isReconnecting: false,
  login: () => {},
  logout: () => {},
  isLoggingOut: () => false,
});

const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY_NAME ?? 'access';

const RETRY_BASE_MS = 15_000;
const RETRY_MAX_MS = 120_000;
const RECONNECTING_THRESHOLD = 2;

const getRetryDelay = (attempt: number) => Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefreshRef = useRef<(accessToken: string) => void>(() => {});
  const refreshFailureCountRef = useRef(0);

  const logoutInProgressRef = useRef(false);

  const logout = useCallback(
    (navigateRoute = '/auth') => {
      if (logoutInProgressRef.current) return; // already logging out — avoid double redirect
      logoutInProgressRef.current = true;

      refreshFailureCountRef.current = 0;
      setIsReconnecting(false);

      authService.clearSession();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      setRefreshToken(null);
      router.push(navigateRoute);
    },
    [router]
  );

  const isLoggingOut = useCallback(() => logoutInProgressRef.current, []);

  // Handles a failed refresh attempt from the *proactive* timer path.
  // - Real auth rejection (401/403): the refresh token is genuinely dead — log out.
  // - Anything else (network error, timeout, 5xx): axiosInstance already left the
  //   session in storage untouched, so just back off and retry instead of logging
  //   the user out over a connectivity blip.
  const handleScheduledRefreshFailure = useCallback(
    (err: unknown, accessToken: string) => {
      const status = (err as AxiosError).response?.status;
      const isAuthRejection = status === 401 || status === 403;

      if (isAuthRejection) {
        refreshFailureCountRef.current = 0;
        setIsReconnecting(false);
        logout();
        return;
      }

      refreshFailureCountRef.current += 1;
      if (refreshFailureCountRef.current >= RECONNECTING_THRESHOLD) {
        setIsReconnecting(true);
      }

      const delay = getRetryDelay(refreshFailureCountRef.current - 1);

      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        scheduleRefreshRef.current(accessToken);
      }, delay);
    },
    [logout]
  );

  scheduleRefreshRef.current = (accessToken: string) => {
    // Only schedule if a refresh token exists — otherwise nothing to refresh with
    if (!authService.getRefreshToken()) return;

    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    try {
      const decoded = jwtDecode<{ exp: number }>(accessToken);
      const expiresInMs = decoded.exp * 1000 - Date.now();
      const refreshInMs = expiresInMs - 60 * 1000;

      const onRefreshSuccess = (newToken: string) => {
        refreshFailureCountRef.current = 0;
        setIsReconnecting(false);
        scheduleRefreshRef.current(newToken);
      };

      if (refreshInMs <= 0) {
        refreshTokens()
          .then(onRefreshSuccess)
          .catch((err) => handleScheduledRefreshFailure(err, accessToken));
        return;
      }

      refreshTimer.current = setTimeout(() => {
        refreshTokens()
          .then(onRefreshSuccess)
          .catch((err) => handleScheduledRefreshFailure(err, accessToken));
      }, refreshInMs);
    } catch {
      // malformed token — reactive interceptor will handle it
    }
  };

  const login = useCallback((accessToken: string, refreshToken?: string) => {
    logoutInProgressRef.current = false; // reset so a future logout isn't swallowed
    refreshFailureCountRef.current = 0;
    setIsReconnecting(false);

    authService.setSession(accessToken, refreshToken);
    // scheduleRefreshRef guards internally — safe to call always
    scheduleRefreshRef.current(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
  }, []);

  const handleAuthError = useCallback(() => logout(), [logout]);

  // Sync with authService + restore session on mount
  useEffect(() => {
    const stored = authService.getToken();
    if (stored) {
      setToken(stored);
      // scheduleRefreshRef will no-op if no refresh token stored
      scheduleRefreshRef.current(stored);
    }
    setRefreshToken(authService.getRefreshToken());
    setInitializing(false);

    const handleAuthChange = (newToken: string | null) => setToken(newToken);
    authService.subscribe(handleAuthChange);
    return () => authService.unsubscribe(handleAuthChange);
  }, []);

  // Cross-tab storage sync
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== TOKEN_KEY) return;
      if (e.newValue) {
        // A valid session exists again (e.g. another tab refreshed) — make sure
        // a stale logout-in-progress flag from this tab doesn't swallow a future
        // legitimate logout() call.
        logoutInProgressRef.current = false;
        refreshFailureCountRef.current = 0;
        setIsReconnecting(false);

        authService.setToken(e.newValue);
        // scheduleRefreshRef will no-op if no refresh token stored
        scheduleRefreshRef.current(e.newValue);
      } else {
        logout();
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [logout]);

  // Global auth error (fired by axiosInstance on unrecoverable 401)
  useEffect(() => {
    window.addEventListener('auth:error', handleAuthError);
    return () => window.removeEventListener('auth:error', handleAuthError);
  }, [handleAuthError]);

  // LOGIN BY THE TOKEN THAT GIVEN FROM BACK-END (ONE-TIME READ)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth');

      if (authToken) {
        login(authToken);
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const authValue = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      refreshToken,
      initializing,
      isReconnecting,
      login,
      logout,
      isLoggingOut,
    }),
    [token, initializing, login, logout, refreshToken, isLoggingOut, isReconnecting]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => use(AuthContext);
