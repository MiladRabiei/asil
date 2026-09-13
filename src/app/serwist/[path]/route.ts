import { createSerwistRoute } from '@serwist/turbopack';

const revision =
  process.env.CI_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    swSrc: 'src/app/sw.ts',
    useNativeEsbuild: true,
    additionalPrecacheEntries: [
      { url: '/', revision },
      { url: '/auth', revision },
      { url: '/offline.html', revision },
    ],
  }
);
