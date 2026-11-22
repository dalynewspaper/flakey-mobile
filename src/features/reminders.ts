import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getPersonDisplayName } from '@/lib/people';
import { syncLocalReminders, type ReminderEvent } from '@/lib/localReminders';

import { useEvents, type FlakeyEvent } from './data';

export function toReminderEvents(events: FlakeyEvent[] | undefined): ReminderEvent[] {
  return (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    date_value: e.date_value,
    date_type: e.date_type,
    personName: e.person ? getPersonDisplayName(e.person) : null,
  }));
}

/** Re-plans on-device reminders whenever dates change and each time the app comes to the foreground. */
export function useLocalReminderSync() {
  const events = useEvents();
  const data = events.data;

  useEffect(() => {
    if (!data) return;
    syncLocalReminders(toReminderEvents(data)).catch((e) => console.warn('Reminder sync failed', e));
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncLocalReminders(toReminderEvents(data)).catch(() => undefined);
    });
    return () => sub.remove();
  }, [data]);
}
