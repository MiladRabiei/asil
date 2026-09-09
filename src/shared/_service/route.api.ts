const API_VERSION = 'api/v1';

// STUB ROUTES — backend doesn't exist yet. Adjust paths once real endpoints
// are defined; nothing else in the auth feature should need to change since
// hook.mutation.tsx is the only place these are consumed.
const APP_AUTH = 'user/client';

const AUTH_INITIATE_ROUTE = `${API_VERSION}/${APP_AUTH}/auth-initiate/`;
const AUTH_LOGIN_PASSWORD_ROUTE = `${API_VERSION}/${APP_AUTH}/login-password/`;
const AUTH_SEND_LOGIN_OTP_ROUTE = `${API_VERSION}/${APP_AUTH}/login-otp-request/`;
const AUTH_FORGET_PASSWORD_ROUTE = `${API_VERSION}/${APP_AUTH}/forget-password-request/`;
const AUTH_VERIFY_OTP_ROUTE = `${API_VERSION}/${APP_AUTH}/verify-otp/`;
const AUTH_RESEND_OTP_ROUTE = `${API_VERSION}/${APP_AUTH}/resend-otp/`;
const AUTH_SET_PASSWORD_ROUTE = `${API_VERSION}/${APP_AUTH}/set-password/`;
const REFRESH_REQUEST_ROUTE = '';
const ME_ROUTE = `${API_VERSION}/${APP_AUTH}/me/`;

// Ported from the exchange-confirmation app. NEXT_PUBLIC_PUSH_MOCK=true
// routes these same paths to this app's own mock Route Handlers
// (src/app/api/v1/push/client/*) instead of the real backend — see
// hook.mutation.tsx. Delete the mock handlers once a real backend exists;
// nothing here needs to change.
const APP_PUSH = 'push/client';
const PUSH_SUBSCRIBE_ROUTE = `${API_VERSION}/${APP_PUSH}/subscribe/`;
const PUSH_UNSUBSCRIBE_ROUTE = `${API_VERSION}/${APP_PUSH}/unsubscribe/`;
const PUSH_UPDATE_TOPICS_ROUTE = `${API_VERSION}/${APP_PUSH}/topics/`; // PROPOSED — ask backend to implement

// EV-domain routes — STUBS, paths are guesses pending backend confirmation.
const APP_EV = 'ev/client';
const BRANCHES_LIST_ROUTE = `${API_VERSION}/${APP_EV}/branches/`;
const BRANCH_DETAIL_ROUTE = (branchId: string) => `${API_VERSION}/${APP_EV}/branches/${branchId}/`;
const BRANCH_BY_CODE_ROUTE = (code: string) =>
  `${API_VERSION}/${APP_EV}/branches/by-code/${encodeURIComponent(code)}/`;
const WALLET_BALANCE_ROUTE = `${API_VERSION}/${APP_EV}/wallet/`;
const WALLET_TRANSACTIONS_ROUTE = `${API_VERSION}/${APP_EV}/wallet/transactions/`;
const CHARGING_START_ROUTE = `${API_VERSION}/${APP_EV}/charging/start/`;
const CHARGING_STOP_ROUTE = `${API_VERSION}/${APP_EV}/charging/stop/`;

export {
  AUTH_FORGET_PASSWORD_ROUTE,
  AUTH_INITIATE_ROUTE,
  AUTH_LOGIN_PASSWORD_ROUTE,
  AUTH_RESEND_OTP_ROUTE,
  AUTH_SEND_LOGIN_OTP_ROUTE,
  AUTH_SET_PASSWORD_ROUTE,
  AUTH_VERIFY_OTP_ROUTE,
  BRANCH_BY_CODE_ROUTE,
  BRANCH_DETAIL_ROUTE,
  BRANCHES_LIST_ROUTE,
  CHARGING_START_ROUTE,
  CHARGING_STOP_ROUTE,
  ME_ROUTE,
  PUSH_SUBSCRIBE_ROUTE,
  PUSH_UNSUBSCRIBE_ROUTE,
  PUSH_UPDATE_TOPICS_ROUTE,
  REFRESH_REQUEST_ROUTE,
  WALLET_BALANCE_ROUTE,
  WALLET_TRANSACTIONS_ROUTE,
};
