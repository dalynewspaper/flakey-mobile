import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { eventIdFromNotification } from '@/lib/push';

/** Tapping a reminder opens that key date. Web has no notifications: see reminder-taps.web.ts. */
export function useReminderTapRouting() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;
    const eventId = eventIdFromNotification(lastResponse);
    if (eventId) router.push({ pathname: '/date/edit', params: { id: eventId } });
    Notifications.clearLastNotificationResponse();
  }, [lastResponse, router]);
}
