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
