import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { sortUpcoming, useEvents, usePerson } from '@/features/data';
import { UpcomingRow } from '@/features/upcoming-row';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, getNextOccurrence, upcomingAge } from '@/lib/dates';
import { getPersonDisplayName, relationshipLabel } from '@/lib/people';
import { Avatar, Button, Card, Divider, ErrorNotice, Loading, Screen, SectionLabel, Text } from '@/ui';

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
  const person = usePerson(id);
  const events = useEvents();

  const dates = useMemo(() => sortUpcoming(events.data?.filter((e) => e.person_id === id)), [events.data, id]);

  if (person.isPending) return <Loading />;
  if (person.isError || !person.data) {
    return (
      <Screen>
        <ErrorNotice error={person.error ?? new Error('This person no longer exists.')} onRetry={() => person.refetch()} />
      </Screen>
    );
  }

  const p = person.data;
  const name = getPersonDisplayName(p);
  const age = p.birthday ? upcomingAge(p.birthday) : null;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => router.push({ pathname: '/person/edit', params: { id: p.id } })}>
              <Text variant="label" style={{ color: t.textStrong }}>
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />
      <Screen>
        <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md }}>
          <Avatar person={p} size={96} />
          <Text variant="title" style={{ textAlign: 'center' }}>
            {name}
          </Text>
          <Text muted>{relationshipLabel(p.relationship_type)}</Text>
          {p.birthday ? (
            <Text muted>
              Birthday {formatLongDate(getNextOccurrence(p.birthday, 'recurring_annual'))}
              {age ? ` · turns ${age}` : ''}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Key dates</SectionLabel>
          {dates.length > 0 ? (
            <Card style={{ paddingVertical: Spacing.xs }}>
              {dates.map((e, i) => (
                <View key={e.id}>
                  {i > 0 ? <Divider /> : null}
                  <UpcomingRow event={e} />
                </View>
              ))}
            </Card>
          ) : (
            <Text muted>No key dates yet.</Text>
          )}
          <Button
            title="Add a key date"
            variant="secondary"
            onPress={() => router.push({ pathname: '/date/edit', params: { personId: p.id } })}
          />
        </View>

        {p.notes ? (
          <View style={{ gap: Spacing.sm }}>
            <SectionLabel>Notes</SectionLabel>
            <Card>
              <Text selectable>{p.notes}</Text>
            </Card>
          </View>
        ) : null}
      </Screen>
    </>
  );
}
