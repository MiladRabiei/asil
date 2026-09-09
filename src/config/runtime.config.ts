const toBoolean = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value === 'true';

const isDevelopment = process.env.NODE_ENV === 'development';

export const runtimeConfig = {
  useMockEvData: toBoolean(process.env.NEXT_PUBLIC_USE_MOCK_EV_DATA, isDevelopment),
  useMockUser: toBoolean(process.env.NEXT_PUBLIC_USE_MOCK_USER, isDevelopment),
  useMockPush: toBoolean(process.env.NEXT_PUBLIC_PUSH_MOCK, isDevelopment),
} as const;
