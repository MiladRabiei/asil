'use client';

import { notify } from '@/lib/notification/notificationService';
import {
  createSubscription,
  destroySubscription,
  getExistingSubscription,
  isPushSupported,
  registerServiceWorker,
} from '@/lib/pushNotifications/pushClient';
import { usePostPushSubscribe, usePostPushUnsubscribe } from '@/shared/_service/hook.mutation';
import { useCallback, useEffect, useState } from 'react';

type Status = 'unsupported' | 'loading' | 'subscribed' | 'unsubscribed' | 'denied' | 'error';

// Core push capability — this is the whole feature if all you need is
// "notify the user." No topic logic lives here; see usePushTopics for the
// optional per-item layer built on top of this.
export function usePushSubscription(userId: string | null) {
  const [status, setStatus] = useState<Status>('loading');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const { mutateAsync: subscribeOnServer } = usePostPushSubscribe(() => {});
  const { mutateAsync: unsubscribeOnServer } = usePostPushUnsubscribe(() => {});

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      return;
    }
    (async () => {
      await registerServiceWorker();
      const existing = await getExistingSubscription();
      setSubscription(existing);
      setStatus(existing ? 'subscribed' : 'unsubscribed');
    })();
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId) {
      notify.info('برای فعال‌سازی اعلان‌ها ابتدا وارد حساب کاربری خود شوید.');
      return null;
    }
    try {
      const sub = await createSubscription(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const json = sub.toJSON();
      await subscribeOnServer({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
        userId,
      });
      setSubscription(sub);
      setStatus('subscribed');
      return sub; // callers that need the fresh endpoint (e.g. usePushTopics) get it directly
    } catch (err) {
      setStatus(
        err instanceof Error && err.message === 'notification_permission_denied'
          ? 'denied'
          : 'error'
      );
      throw err;
    }
  }, [userId, subscribeOnServer]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    await destroySubscription(subscription);
    await unsubscribeOnServer({ endpoint: subscription.endpoint });
    setSubscription(null);
    setStatus('unsubscribed');
  }, [subscription, unsubscribeOnServer]);

  return { status, subscription, subscribe, unsubscribe };
}
