'use client';

import { useUser } from '@/context/UserContext';
import { notify } from '@/lib/notification/notificationService';
import { usePushSubscription } from '@/shared/hooks/usePushSubscription';
import { usePushTopics } from '@/shared/hooks/usePushTopics';
import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';

export interface NotificationBellToggleProps {
  topicId: string;
  topicType: 'branch' | 'session';
  className?: string;
}

// Torob-style contextual bell. Works two ways depending on
// NEXT_PUBLIC_PUSH_TOPICS_ENABLED, with no branching needed by callers:
// - topics ON:  each bell tracks its own item independently
// - topics OFF: every bell just mirrors one global subscribed/unsubscribed
//               state — still a working "notify me" toggle, just not
//               per-item yet. Flip the env var later; this component
//               doesn't change.
export function NotificationBellToggle({
  topicId,
  topicType,
  className,
}: NotificationBellToggleProps) {
  const { user } = useUser();
  const { status, subscription, subscribe, unsubscribe } = usePushSubscription(
    user?.id ? String(user.id) : null
  );
  const { topicsEnabled, isTopicSubscribed, subscribeToTopic, unsubscribeFromTopic } =
    usePushTopics(subscription?.endpoint ?? null);
  const [pending, setPending] = useState(false);

  if (status === 'unsupported') return null;

  const active = topicsEnabled ? isTopicSubscribed(topicType, topicId) : status === 'subscribed';

  const handleClick = async () => {
    if (!user?.id) {
      notify.info('برای دریافت اعلان ابتدا وارد حساب کاربری خود شوید.');
      return;
    }
    setPending(true);
    try {
      if (!topicsEnabled) {
        // Plain global toggle — the whole feature when topics are off.
        if (active) {
          await unsubscribe();
        } else {
          await subscribe();
        }
        notify.success(active ? 'اعلان‌ها غیرفعال شد' : 'اعلان‌ها فعال شد');
        return;
      }

      if (status !== 'subscribed') await subscribe();
      if (active) {
        await unsubscribeFromTopic(topicType, topicId);
        notify.success('اعلان‌های این مورد غیرفعال شد');
      } else {
        await subscribeToTopic(topicType, topicId);
        notify.success('برای این مورد اعلان دریافت می‌کنید');
      }
    } catch {
      notify.error('فعال‌سازی اعلان ممکن نشد');
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? 'غیرفعال‌سازی اعلان' : 'فعال‌سازی اعلان'}
      className={className ?? 'btn btn-sm btn-circle btn-ghost'}
    >
      {active ? <Bell className="fill-current" size={18} /> : <BellOff size={18} />}
    </button>
  );
}
