import { parseDateOnly, type DateType } from './dates';

/**
 * Pure planning for on-device reminders (no Expo imports, so it can be unit
 * tested in Node). Scheduling lives in localReminders.ts.
 */

export const REMINDER_OFFSETS = [30, 10, 3, 1, 0] as const;
export const REMINDER_HOUR = 9; // 9am local time
export const MAX_SCHEDULED = 60;
export const ID_PREFIX = 'flakey-reminder:';

export interface ReminderEvent {
  id: string;
  title: string;
  date_value: string | null;
  date_type: DateType;
  personName: string | null;
}

export interface PlannedReminder {
  id: string;
  eventId: string;
  fireAt: Date;
  daysBefore: number;
  title: string;
  body: string;
}

/** Mirrors composeReminderTitle in the server's send-event-reminders. */
export function reminderTitle(daysBefore: number, eventTitle: string, personName: string | null): string {
  const forWhom = personName && !eventTitle.includes(personName) ? ` for ${personName}` : '';
  if (daysBefore === 0) return `🎉 Today: ${eventTitle}${forWhom}`;
  if (daysBefore === 1) return `⏰ Tomorrow: ${eventTitle}${forWhom}`;
  return `${eventTitle}${forWhom} is in ${daysBefore} days`;
}

function reminderBody(daysBefore: number, personName: string | null): string {
  const who = personName ?? 'them';
  if (daysBefore === 0) return `A quick message to ${who} goes a long way.`;
  if (daysBefore <= 3) return `Still time for something thoughtful for ${who}.`;
  return `Plenty of time to plan something for ${who}.`;
}

/** Next occurrence on or after `now`'s calendar day (yearly dates roll forward). */
function nextOccurrenceFrom(dateValue: string, dateType: DateType, now: Date): Date {
  const date = parseDateOnly(dateValue);
  if (dateType !== 'recurring_annual') return date;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next;
}

/** Pure planner: every future reminder for the given events, soonest first, capped. */
export function planReminders(events: ReminderEvent[], now: Date = new Date(), limit = MAX_SCHEDULED): PlannedReminder[] {
  const planned: PlannedReminder[] = [];
  for (const e of events) {
    if (!e.date_value) continue;
    const first = nextOccurrenceFrom(e.date_value, e.date_type, now);
    // For yearly dates also plan the following year, so "30 days before"
    // reminders for an occurrence just after today's are still covered.
    const occurrences = e.date_type === 'recurring_annual' ? [first, new Date(first.getFullYear() + 1, first.getMonth(), first.getDate())] : [first];
    for (const occurrence of occurrences) {
      for (const daysBefore of REMINDER_OFFSETS) {
        const fireAt = new Date(occurrence.getFullYear(), occurrence.getMonth(), occurrence.getDate() - daysBefore, REMINDER_HOUR, 0, 0);
        if (fireAt <= now) continue;
        planned.push({
          id: `${ID_PREFIX}${e.id}:${occurrence.getFullYear()}:${daysBefore}`,
          eventId: e.id,
          fireAt,
          daysBefore,
          title: reminderTitle(daysBefore, e.title, e.personName),
          body: reminderBody(daysBefore, e.personName),
        });
      }
    }
  }
  return planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, limit);
}
