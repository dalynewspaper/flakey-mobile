import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { describeDaysUntil, EVENT_TYPE_META, formatDayMonth, getNextOccurrence } from '@/lib/dates';
import { getPersonDisplayName } from '@/lib/people';
import { DaysBadge, Row, Text } from '@/ui';

import type { UpcomingEvent } from './data';

export function UpcomingRow({ event }: { event: UpcomingEvent }) {
  const router = useRouter();
  const t = useTheme();
  const meta = EVENT_TYPE_META[event.event_type];
  const when = formatDayMonth(getNextOccurrence(event.date_value!, event.date_type));
  const who = event.person ? getPersonDisplayName(event.person) : null;
  return (
    <Row
      onPress={() => router.push({ pathname: '/date/edit', params: { id: event.id } })}
      leading={
        <View
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
        </View>
      }
      title={event.title}
      subtitle={[when, who].filter(Boolean).join(' · ')}
      trailing={<DaysBadge days={event.daysUntil} label={describeDaysUntil(event.daysUntil)} />}
    />
  );
}
