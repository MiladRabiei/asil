// The 3 contexts an OTP can belong to — backend needs this to know which
// code/purpose it's validating against.
export type AuthFlowSchema = 'LOGIN' | 'SIGNUP' | 'FORGET_PASSWORD';

export interface SetPasswordFormSchema {
  password: string;
  passwordConfirmation: string;
}

// Shape errors get rejected with by lib/axiosInstance's `post/put/patch` helpers
// (see UNKNOWN_ERROR fallback there).
export interface ErrorResponseSchema {
  statusCode: number;
  message: string;
}
// Kept from the boilerplate's role-guard pattern (see access.utils.ts /
// sidebarNav.config.ts) even though the EV app currently has a single
// consumer role — cheap to keep, and it's the one edit needed if an
// operator/back-office role ever gets its own views in this same app.
export type Roles = 'USER';

// Minimal shape of the logged-in user. Extend as fields are confirmed —
// consumers should always go through `useUser()` (see /src/context/UserContext.tsx),
// never fetch or shape this themselves, so growing this interface doesn't
// ripple outward.
export interface IUser {
  id: string;
  name: string;
  phone?: string;
  role: Roles;
}

// pwa — ported from the exchange-confirmation app's pwaInstall/useInstallPrompt
export type IInstallPlatformType = 'ios' | 'android' | 'desktop' | 'unknown';

export interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
