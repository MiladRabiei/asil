'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export interface CustomErrorResponseSchema {
  message: string;
  statusCode: number;
}

interface WithAuthOptions {
  redirectPath?: string;
}

const withAuth = (options?: WithAuthOptions) => {
  const { redirectPath = '/' } = options ?? {};

  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function ComponentWithAuth(props: any) {
      const router = useRouter();
      const { token, initializing, isAuthenticated, isLoggingOut } = useAuth();

      useEffect(() => {
        if (!isAuthenticated && !initializing && !token) {
          if (isLoggingOut()) return;

          sessionStorage.setItem(
            'redirectAfterLogin',
            window.location.pathname + window.location.search
          );
          router.replace(redirectPath);
        }
      }, [token, initializing, redirectPath, isAuthenticated, isLoggingOut]);

      if (initializing) {
        return (
          <div className="flex flex-col gap-lg m-auto h-screen justify-center items-center">
            <h3 className="text-2xl">در حال دریافت اطلاعات کاربر</h3>
            <span className="loading loading-infinity loading-xl text-primary"></span>
          </div>
        );
      }

      if (!isAuthenticated) {
        return null;
      }

      return <WrappedComponent {...props} />;
    };
  };
};

export default withAuth;
