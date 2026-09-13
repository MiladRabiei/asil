// Push-notification payload/response types — ported from the
// exchange-confirmation app's push feature (subscribe/unsubscribe/topics).
// Kept in their own file rather than interface.payload.ts / interface.response.ts
// since this is a self-contained feature port, not part of the auth vocabulary.

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface CreatePushSubscribePayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userId: string;
}
export interface CreatePushSubscribeResponse {}

export interface CreatePushUnsubscribePayload {
  endpoint: string;
}
export interface CreatePushUnsubscribeResponse {}

// EV-specific topics — swap 'branch' for whatever unit the backend settles
// on (branch === charging station in this app); 'order' from the source app
// became 'session' (a charging session) here.
export type PushTopicType = 'branch' | 'session';

export interface PushTopic {
  type: PushTopicType;
  id: string;
}

export interface UpdatePushTopicsPayload {
  endpoint: string;
  topics: PushTopic[];
}
export interface UpdatePushTopicsResponse {}

// Shape of the JSON payload the backend sends inside a push message itself
// (decoded via `event.data.json()` in src/app/sw.ts) — distinct from the
// subscribe/topic management types above, which describe calls this app
// makes TO the backend, not messages the backend pushes TO this app.
//
// Every notification type shares the same optional fields — the backend
// sends a ready-made `url`/`icon`/`actions` directly, not a raw
// branchId/sessionId for the worker to build a URL from — and each type
// only differs in which fallback title/body strings apply when the
// backend omits them (see resolveNotificationContent in sw.ts).
export type PushNotificationType =
  'branch_offline' | 'branch_available' | 'charging_session' | 'wallet' | 'promo';

export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotificationPayload {
  // Untyped string fallback included deliberately: an older/newer backend
  // version sending a `type` this build doesn't recognize should still
  // fall through to the generic branch below instead of failing to compile
  // against a closed union.
  type?: PushNotificationType | string;
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
  actions?: PushNotificationAction[];
}
