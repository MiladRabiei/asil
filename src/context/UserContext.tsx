'use client';

import { useAuth } from '@/context/AuthContext';
import type { IUser, Roles } from '@/shared/_service/interface.schema';
import { useGetCurrentUser } from '@/shared/_service/hook.query';
import React, { createContext, use, useMemo } from 'react';

interface IUserContext {
  user: IUser | undefined;
  role: Roles | undefined;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<IUserContext>({
  user: undefined,
  role: undefined,
  isLoading: false,
  isError: false,
});

// Everything role-based (sidebar items, per-role page content, future route
// guards) should read `role`/`user` from here — never call the fetch hook or
// decode a token directly. That keeps the eventual switch to a real backend
// (JWT claim vs. a real /me call, or both) contained to hook.query.tsx.
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Only fetch once there's a session — otherwise every anonymous page load
  // fires a doomed request.
  const { data, isLoading, isError } = useGetCurrentUser(isAuthenticated);

  const value = useMemo<IUserContext>(
    () => ({
      user: isAuthenticated ? data : undefined,
      role: isAuthenticated ? data?.role : undefined,
      isLoading: isAuthenticated && isLoading,
      isError,
    }),
    [isAuthenticated, data, isLoading, isError]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => use(UserContext);
