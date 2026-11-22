import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

import { ID_PREFIX, planReminders, type ReminderEvent } from './reminderPlan';

export { REMINDER_HOUR, REMINDER_OFFSETS } from './reminderPlan';
export type { ReminderEvent } from './reminderPlan';

/**
 * On-device reminders: the phone schedules its own notifications for upcoming
 * key dates, so reminders work offline and without any server push setup.
 * Same offsets as the server job (send-event-reminders): 30, 10, 3, 1 days
 * before, and on the day.
 *
 * iOS keeps at most 64 pending local notifications per app, so we schedule the
 * soonest ones and top up every time the app opens or a date changes.
 */

const SIGNATURE_KEY = 'flakey.localReminders.signature';

/**
 * Replaces this app's scheduled reminders with a fresh plan. Skips the work
 * when nothing changed since the last sync. Needs notification permission.
 */
export async function syncLocalReminders(events: ReminderEvent[]): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return 0;

  const plan = planReminders(events);
  const signature = plan.map((p) => `${p.id}@${p.fireAt.getTime()}|${p.title}`).join('\n');
  const previous = await AsyncStorage.getItem(SIGNATURE_KEY);
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ours = scheduled.filter((n) => n.identifier.startsWith(ID_PREFIX));
  if (previous === signature && ours.length === plan.length) return plan.length;

  await Promise.all(ours.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  for (const p of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: p.id,
      content: { title: p.title, body: p.body, data: { event_id: p.eventId, days_until: p.daysBefore } },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: p.fireAt, channelId: 'reminders' },
    });
  }
  await AsyncStorage.setItem(SIGNATURE_KEY, signature);
  return plan.length;
}

/** Clears all scheduled reminders, e.g. on sign-out. */
export async function clearLocalReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.filter((n) => n.identifier.startsWith(ID_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  await AsyncStorage.removeItem(SIGNATURE_KEY);
}
