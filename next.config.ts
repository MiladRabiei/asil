import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

type WebpackRule = {
  test?: RegExp;
  exclude?: RegExp;
  issuer?: unknown;
  resourceQuery?: { not?: RegExp[] };
  [key: string]: unknown;
};

type WebpackConfig = {
  module?: {
    rules?: WebpackRule[];
  };
};

const nextConfig: NextConfig = {
  // Allow your phone to access Next.js dev resources/HMR
  allowedDevOrigins: ['172.22.3.85'],

  async headers() {
    return [
      {
        source: '/serwist/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.gsm.ir',
      },
    ],
  },

  turbopack: {
    rules: {
      './public/img/svg/icons/*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: { icon: true, dimensions: false },
          },
        ],
        as: '*.js',
      },
    },
  },

  webpack(config: WebpackConfig) {
    const fileLoaderRule = config.module?.rules?.find(
      (rule: WebpackRule) => rule.test instanceof RegExp && rule.test.test('.svg')
    );

    config.module?.rules?.push({
      test: /\.svg$/i,
      include: /public[\\/]img[\\/]svg[\\/]icons/,
      use: [
        {
          loader: '@svgr/webpack',
          options: { icon: true, dimensions: false },
        },
      ],
    });

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /public[\\/]img[\\/]svg[\\/]icons/;
    }

    return config;
  },
};

export default withSerwist(nextConfig);
