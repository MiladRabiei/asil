'use client';

import { usePostPushUpdateTopics } from '@/shared/_service/hook.mutation';
import type { PushTopic, PushTopicType } from '@/shared/_service/interface.push';
import { useCallback, useEffect, useState } from 'react';

type TopicType = PushTopicType;
type Topic = PushTopic;

const TOPICS_STORAGE_KEY = 'push-topics';

// Master switch. false (default) = topics are fully inert: isTopicSubscribed
// always returns false and subscribeToTopic/unsubscribeFromTopic just no-op
// on the server side, so callers (e.g. NotificationBellToggle) can treat
// this hook identically either way and simply fall back to a plain
// subscribe/unsubscribe toggle when it's off. Flip on once your backend
// actually implements the topics endpoint below.
const TOPICS_ENABLED = process.env.NEXT_PUBLIC_PUSH_TOPICS_ENABLED === 'true';

function loadTopics(): Topic[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TOPICS_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * Optional per-item notification layer. Pass the current push subscription's
 * endpoint (or null if not subscribed yet). Entirely inert when
 * NEXT_PUBLIC_PUSH_TOPICS_ENABLED is off — safe to leave wired up in
 * components even before the backend supports it.
 *
 * *** THE TWO THINGS YOU NEED TO WIRE UP FOR YOUR REAL BACKEND ***
 * 1. The mutation: `usePostPushUpdateTopics` in hook.mutation.tsx — point it
 *    at whatever real route your backend team builds (replace
 *    PUSH_UPDATE_TOPICS_ROUTE / drop the PUSH_MOCK branch there).
 * 2. The update function: `persistTopics` below — this is the one place
 *    that decides what gets sent to the server on every toggle. If your
 *    backend wants a different shape (e.g. one call per topic instead of
 *    the whole array), change it here only; callers don't need to know.
 */
export function usePushTopics(endpoint: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const { mutateAsync: updateTopicsOnServer } = usePostPushUpdateTopics(() => {});

  useEffect(() => {
    setTopics(loadTopics());
  }, []);

  const persistTopics = useCallback(
    async (next: Topic[]) => {
      setTopics(next);
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(next));
      if (!TOPICS_ENABLED || !endpoint) return;
      await updateTopicsOnServer({ endpoint, topics: next });
    },
    [endpoint, updateTopicsOnServer]
  );

  const isTopicSubscribed = useCallback(
    (type: TopicType, id: string) =>
      TOPICS_ENABLED && topics.some((t) => t.type === type && t.id === id),
    [topics]
  );

  const subscribeToTopic = useCallback(
    (type: TopicType, id: string) => persistTopics([...topics, { type, id }]),
    [topics, persistTopics]
  );

  const unsubscribeFromTopic = useCallback(
    (type: TopicType, id: string) =>
      persistTopics(topics.filter((t) => !(t.type === type && t.id === id))),
    [topics, persistTopics]
  );

  return {
    topicsEnabled: TOPICS_ENABLED,
    isTopicSubscribed,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
}
