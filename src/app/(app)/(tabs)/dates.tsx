import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { sortUpcoming, useEvents, type UpcomingEvent } from '@/features/data';
import { UpcomingRow } from '@/features/upcoming-row';
import { getNextOccurrence } from '@/lib/dates';
import { AddButton, Button, Card, Divider, EmptyState, ErrorNotice, Loading, SectionLabel } from '@/ui';
import { TabScreen } from '@/ui/tab-screen';

export default function DatesScreen() {
  const router = useRouter();
  const events = useEvents();

  // Group the next 12 months of dates by month of next occurrence.
  const sections = useMemo(() => {
    const groups = new Map<string, UpcomingEvent[]>();
    for (const e of sortUpcoming(events.data, 366)) {
      const key = getNextOccurrence(e.date_value!, e.date_type).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    return [...groups.entries()];
  }, [events.data]);

  if (events.isPending) return <Loading />;

  return (
    <TabScreen
      title="Dates"
      eyebrow="The year ahead"
      action={<AddButton label="Add a key date" onPress={() => router.push('/date/edit')} />}
      refreshing={events.isRefetching}
      onRefresh={() => events.refetch()}>
      {events.isError ? (
        <ErrorNotice error={events.error} onRetry={() => events.refetch()} />
      ) : sections.length === 0 ? (
        <EmptyState
          title="No key dates yet"
          body="Birthdays, anniversaries, the little days that matter. Add one and Flakey will remind you in good time."
          action={<Button title="Add a key date" onPress={() => router.push('/date/edit')} />}
        />
      ) : (
        sections.map(([month, items]) => (
          <View key={month} style={{ gap: Spacing.sm }}>
            <SectionLabel>{month}</SectionLabel>
            <Card style={{ paddingVertical: Spacing.xs }}>
              {items.map((e, i) => (
                <View key={e.id}>
                  {i > 0 ? <Divider /> : null}
                  <UpcomingRow event={e} />
                </View>
              ))}
            </Card>
          </View>
        ))
      )}
    </TabScreen>
  );
}
