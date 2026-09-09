// shared/hooks/useDraftSearchParams.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseDraftSearchParamsProps {
  isActive: boolean; // pass filterDrawer.isOpen
  getAllSearchParams: () => Record<string, string>;
}

const useDraftSearchParams = ({ isActive, getAllSearchParams }: UseDraftSearchParamsProps) => {
  const [draft, setDraft] = useState<Record<string, string>>({});

  // Re-seed the draft from committed URL params every time the drawer opens,
  // so an un-applied edit from a previous "cancelled" session doesn't leak in.
  useEffect(() => {
    if (isActive) {
      setDraft(getAllSearchParams());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const getSearchParam = useCallback((key: string): string => draft[key] ?? '', [draft]);

  const getSearchParamArray = useCallback(
    (key: string): string[] => (draft[key] ? draft[key].split(',').filter(Boolean) : []),
    [draft]
  );

  // Note: keys are kept (set to '') rather than deleted, so a cleared filter
  // is still explicitly communicated when the draft is committed.
  const setSearchParam = useCallback((key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setSearchParams = useCallback((entries: Record<string, string>) => {
    setDraft((prev) => ({ ...prev, ...entries }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, ''])));
  }, []);

  const draftSearchParams = new URLSearchParams(
    Object.fromEntries(Object.entries(draft).filter(([, value]) => !!value))
  );

  return {
    draft, // full record, incl. '' — use this to commit via the real setSearchParams
    draftSearchParams, // URLSearchParams view — use this for the `searchParams` prop
    getSearchParam,
    getSearchParamArray,
    setSearchParam,
    setSearchParams,
    resetDraft,
  };
};

export default useDraftSearchParams;
