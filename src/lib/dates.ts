import type { Database } from './database.types';

export type EventType = Database['public']['Enums']['event_type'];
export type DateType = Database['public']['Enums']['date_type'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Parses a yyyy-MM-dd value as a local calendar date (no UTC shift). */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** Next occurrence of an event; recurring dates roll forward to this or next year. */
export function getNextOccurrence(dateValue: string, dateType: DateType): Date {
  const date = parseDateOnly(dateValue);
  if (dateType !== 'recurring_annual') return date;
  const today = startOfToday();
  const next = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next;
}

export function getDaysUntil(dateValue: string, dateType: DateType): number {
  const diff = getNextOccurrence(dateValue, dateType).getTime() - startOfToday().getTime();
  return Math.round(diff / 86_400_000);
}

export function describeDaysUntil(days: number): string {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' });
}

/**
 * Age the person turns on their next birthday. The web wizard stores the
 * current year when the birth year is unknown, so treat recent years as unknown.
 */
export function upcomingAge(birthday: string): number | null {
  const born = parseDateOnly(birthday);
  if (born.getFullYear() < 1900 || born.getFullYear() >= new Date().getFullYear() - 1) return null;
  return getNextOccurrence(birthday, 'recurring_annual').getFullYear() - born.getFullYear();
}

function nthSunday(year: number, month: number, n: number): string {
  const first = new Date(year, month, 1).getDay();
  const day = 1 + ((7 - first) % 7) + (n - 1) * 7;
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function nextFixed(builder: (year: number) => string): string {
  const today = startOfToday();
  const thisYear = builder(today.getFullYear());
  return parseDateOnly(thisYear) < today ? builder(today.getFullYear() + 1) : thisYear;
}

export interface EventTypeMeta {
  label: string;
  emoji: string;
  buildTitle: (personName: string | null) => string;
  /** Next date for holidays with a fixed calendar date; null when the user picks. */
  getDefaultDate: () => string | null;
  fixedDate: boolean;
  autoTitle: boolean;
}

/** Mirrors src/lib/eventTypeMeta.ts in the web app. */
export const EVENT_TYPE_META: Record<EventType, EventTypeMeta> = {
  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    buildTitle: (n) => (n ? `${n}'s Birthday` : 'Birthday'),
    getDefaultDate: () => null,
    fixedDate: false,
    autoTitle: true,
  },
  anniversary: {
    label: 'Anniversary',
    emoji: '💍',
    buildTitle: (n) => (n ? `Anniversary with ${n}` : 'Anniversary'),
    getDefaultDate: () => null,
    fixedDate: false,
    autoTitle: true,
  },
  christmas: {
    label: 'Christmas',
    emoji: '🎄',
    buildTitle: (n) => (n ? `Christmas with ${n}` : 'Christmas'),
    getDefaultDate: () => nextFixed((y) => `${y}-12-25`),
    fixedDate: true,
    autoTitle: true,
  },
  mothers_day: {
    label: "Mother's Day",
    emoji: '💐',
    buildTitle: (n) => (n ? `Mother's Day for ${n}` : "Mother's Day"),
    getDefaultDate: () => nextFixed((y) => nthSunday(y, 4, 2)),
    fixedDate: true,
    autoTitle: true,
  },
  fathers_day: {
    label: "Father's Day",
    emoji: '👔',
    buildTitle: (n) => (n ? `Father's Day for ${n}` : "Father's Day"),
    getDefaultDate: () => nextFixed((y) => nthSunday(y, 5, 3)),
    fixedDate: true,
    autoTitle: true,
  },
  valentines: {
    label: "Valentine's Day",
    emoji: '💝',
    buildTitle: (n) => (n ? `Valentine's with ${n}` : "Valentine's Day"),
    getDefaultDate: () => nextFixed((y) => `${y}-02-14`),
    fixedDate: true,
    autoTitle: true,
  },
  custom: {
    label: 'Something else',
    emoji: '✨',
    buildTitle: () => '',
    getDefaultDate: () => null,
    fixedDate: false,
    autoTitle: false,
  },
};

export const EVENT_TYPES_ORDER: EventType[] = [
  'birthday',
  'anniversary',
  'christmas',
  'mothers_day',
  'fathers_day',
  'valentines',
  'custom',
];
