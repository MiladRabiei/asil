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
export type PushNotificationPayload =
  | { type: 'branch_offline'; title: string; body: string; branchId: string }
  | { type: 'branch_available'; title: string; body: string; branchId: string }
  | { type: 'charging_session'; title: string; body: string; sessionId: string }
  | { type: 'wallet'; title: string; body: string }
  | { type: 'promo'; title: string; body: string; url: string }
  // Anything else — including a payload from an older app version whose
  // `type` this build no longer recognizes, or a malformed/missing `type` —
  // still needs a title/body to fall back to; see the `default` case in
  // sw.ts's resolveNotificationContent. `type` here is `undefined`, not
  // `string`, on purpose: a wide `string` tag overlaps the literal tags
  // above and breaks switch narrowing on `payload.type` for every other
  // case, not just this one.
  | { type?: undefined; title?: string; body?: string };
