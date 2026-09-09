'use client';

import LocalStoragePersister from '.';

export const tokenPersister = new LocalStoragePersister(
  process.env.NEXT_PUBLIC_TOKEN_KEY_NAME ?? 'access'
);
export const refreshTokenPersister = new LocalStoragePersister(
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY_NAME ?? 'refresh'
);
