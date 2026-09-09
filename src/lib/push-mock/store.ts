// TESTING-ONLY MOCK. Delete this whole src/lib/push-mock/ directory and the
// src/app/api/v1/push/client/* route handlers once the real backend team
// ships these endpoints — nothing else in the app needs to change, since
// the frontend already talks to '/api/v1/push/client/...' either way
// (see route.api.ts). Just flip NEXT_PUBLIC_BASE_URL back to the real API.
//
// In-memory only: this resets whenever the dev server restarts, and is not
// shared across serverless function instances in production. That's fine
// for local/manual testing but never deploy relying on this for real data.

interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId: string;
  topics: { type: 'branch' | 'session'; id: string }[];
}

const subscriptions = new Map<string, StoredSubscription>();

export const mockPushStore = {
  add(sub: Omit<StoredSubscription, 'topics'> & { topics?: StoredSubscription['topics'] }) {
    const existing = subscriptions.get(sub.endpoint);
    subscriptions.set(sub.endpoint, { topics: existing?.topics ?? [], ...sub });
  },
  updateTopics(endpoint: string, topics: StoredSubscription['topics']) {
    const existing = subscriptions.get(endpoint);
    if (!existing) return false;
    subscriptions.set(endpoint, { ...existing, topics });
    return true;
  },
  remove(endpoint: string) {
    subscriptions.delete(endpoint);
  },
  all() {
    return [...subscriptions.values()];
  },
  forUser(userId: string) {
    return [...subscriptions.values()].filter((s) => s.userId === userId);
  },
  forTopic(type: 'branch' | 'session', id: string) {
    return [...subscriptions.values()].filter((s) =>
      s.topics.some((t) => t.type === type && t.id === id)
    );
  },
};
