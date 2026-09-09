'use client';

import useCustomSearchParams from '@/shared/hooks/useCustomSearchParams';
import { usePathname } from 'next/navigation';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
interface UseModalStateOptions {
  initialState?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  /**
   * When provided, the modal's open/closed state is driven by this
   * query param instead of local React state. Opening pushes a new
   * history entry (so the browser back button closes the modal);
   * closing calls history.back() so the close button and the native
   * back button stay equivalent.
   */
  paramKey?: string;
  closeOnRefresh?: boolean;
}

export interface UseModalStateReturn {
  isOpen: boolean;
  open: (value?: string) => void;
  close: () => void;
  toggle: () => void;
  /** Only meaningful when `paramKey` is used (e.g. selected product id). */
  value: string;
}

const useLocalModalState = ({
  initialState = false,
  onOpen,
  onClose,
}: UseModalStateOptions): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) onOpen?.();
      return true;
    });
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) onClose?.();
      return false;
    });
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) onOpen?.();
      else onClose?.();
      return next;
    });
  }, [onOpen, onClose]);

  return { isOpen, open, close, toggle, value: '' };
};

const useUrlModalState = (
  paramKey: string,
  { onOpen, onClose, closeOnRefresh = false }: UseModalStateOptions
): UseModalStateReturn => {
  const { getSearchParam, setSearchParam } = useCustomSearchParams();
  const pathname = usePathname();
  const isMounted = useRef(false);
  const prevPathname = useRef(pathname);

  const value = getSearchParam(paramKey);

  const isOpen = closeOnRefresh && !isMounted.current ? false : !!value;

  useLayoutEffect(() => {
    if (closeOnRefresh && getSearchParam(paramKey)) {
      setSearchParam(paramKey, '', true);
    }
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guards against Next's soft-navigation cache leaving a stale paramKey
  // in the URL when navigating to a new pathname via <Link> (which doesn't
  // go through useCustomSearchParams' window.history navigate()). Without
  // this, a leftover e.g. ?modal=123 from the previous page can reopen the
  // modal on a page that never asked for it to be open.
  useLayoutEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (getSearchParam(paramKey)) {
        setSearchParam(paramKey, '', true);
      }
    }
  }, [pathname, paramKey, getSearchParam, setSearchParam]);

  const open = useCallback(
    (newValue: string = '1') => {
      setSearchParam(paramKey, newValue);
      onOpen?.();
    },
    [paramKey, setSearchParam, onOpen]
  );

  const closeViaHistory = useCallback(() => {
    if (getSearchParam(paramKey)) {
      window.history.back();
      onClose?.();
    }
  }, [paramKey, getSearchParam, onClose]);

  const closeViaReplace = useCallback(() => {
    if (getSearchParam(paramKey)) {
      setSearchParam(paramKey, '', true);
      onClose?.();
    }
  }, [paramKey, getSearchParam, setSearchParam, onClose]);

  const close = closeOnRefresh ? closeViaHistory : closeViaReplace;

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return { isOpen, open, close, toggle, value };
};

export const useModalState = (options: UseModalStateOptions): UseModalStateReturn => {
  const { paramKey, ...rest } = options;
  // Hook choice is based on whether `paramKey` is passed, which call
  // sites decide once at the top of their component and don't change
  // across renders — so this conditional call is stable in practice.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return paramKey ? useUrlModalState(paramKey, rest) : useLocalModalState(rest);
};

export default useModalState;
