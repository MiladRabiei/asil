'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const useCustomSearchParams = (initialValues?: Record<string, string>) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Always read from window.location.search — never stale, no React render cycle dependency
  const buildParams = useCallback(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []); // intentionally no deps

  // Use window.history directly — Next.js guarantees this updates useSearchParams()
  // and avoids router cache swallowing same-path navigations
  const navigate = useCallback(
    (params: URLSearchParams, replace = false) => {
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (replace) {
        window.history.replaceState(null, '', url);
      } else {
        window.history.pushState(null, '', url);
      }
    },
    [pathname]
  );

  // Inject defaults once — only when URL has no params
  useEffect(() => {
    if (!initialValues) return;
    if (window.location.search) return;
    navigate(new URLSearchParams(initialValues), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setSearchParam = useCallback(
    (key: string, value: string, replace = false) => {
      const params = buildParams();
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      navigate(params, replace);
    },
    [buildParams, navigate]
  );

  const setSearchParams = useCallback(
    (entries: Record<string, string>, replace = false) => {
      const params = buildParams();
      Object.entries(entries).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      navigate(params, replace);
    },
    [buildParams, navigate]
  );

  const toggleSearchParamValue = useCallback(
    (key: string, value: string) => {
      const params = buildParams();
      const existing = params.get(key)?.split(',').filter(Boolean) ?? [];
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      if (updated.length === 0) {
        params.delete(key);
      } else {
        params.set(key, updated.join(','));
      }
      navigate(params);
    },
    [buildParams, navigate]
  );

  // ── Getters — still read from useSearchParams() so components re-render ──

  const getSearchParam = useCallback(
    (key: string): string => searchParams.get(key) ?? '',
    [searchParams]
  );

  const getAllSearchParams = useCallback((): Record<string, string> => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const getSearchParamArray = useCallback(
    <T extends string | number = string>(key: string, parser?: (value: string) => T): T[] => {
      const raw = searchParams.get(key);
      if (!raw) return [];
      return raw
        .split(',')
        .filter(Boolean)
        .map((item) => (parser ? parser(item) : (item as T)));
    },
    [searchParams]
  );

  const getFilters = useCallback(
    (
      exclude: string[] = ['page', 'limit', 'ordering', 'searchModel', 'filter', 'sort']
    ): Record<string, string | string[]> => {
      return Object.fromEntries(
        [...searchParams.entries()]
          .filter(([key]) => !exclude.includes(key) && !key.toLowerCase().includes('modal'))
          .map(([key, value]) => [
            key,
            value.includes(',') ? value.split(',').filter(Boolean) : value,
          ])
      );
    },
    [searchParams]
  );

  return {
    searchParams,
    setSearchParam,
    setSearchParams,
    toggleSearchParamValue,
    getSearchParam,
    getAllSearchParams,
    getSearchParamArray,
    getFilters,
  };
};

export default useCustomSearchParams;
