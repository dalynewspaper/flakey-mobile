import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { sortUpcoming, useEvents, usePeople } from '@/features/data';
import { describeDaysUntil } from '@/lib/dates';
import { getPersonDisplayName, getPersonFullName, relationshipLabel } from '@/lib/people';
import { AddButton, Avatar, Button, Card, Divider, EmptyState, ErrorNotice, Field, Loading, Row, Text } from '@/ui';
import { TabScreen } from '@/ui/tab-screen';

export default function PeopleScreen() {
  const router = useRouter();
  const people = usePeople();
  const events = useEvents();
  const [query, setQuery] = useState('');

  // Soonest upcoming date per person, for the row subtitle.
  const nextByPerson = useMemo(() => {
    const map = new Map<string, { title: string; days: number }>();
    for (const e of sortUpcoming(events.data)) {
      if (e.person_id && !map.has(e.person_id)) map.set(e.person_id, { title: e.title, days: e.daysUntil });
    }
    return map;
  }, [events.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = people.data ?? [];
    if (!q) return list;
    return list.filter((p) => `${getPersonFullName(p)} ${p.nickname ?? ''}`.toLowerCase().includes(q));
  }, [people.data, query]);

  if (people.isPending) return <Loading />;

  return (
    <TabScreen
      eyebrow={people.data ? `${people.data.length} in your circle` : undefined}
      title="People"
      action={<AddButton label="Add someone" onPress={() => router.push('/person/new')} />}
      refreshing={people.isRefetching}
      onRefresh={() => {
        people.refetch();
        events.refetch();
      }}>
      {people.isError ? (
        <ErrorNotice error={people.error} onRetry={() => people.refetch()} />
      ) : (people.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Start your garden"
          body="Add the people you don't want to drift from."
          action={<Button title="Add someone" onPress={() => router.push('/person/new')} />}
        />
      ) : (
        <>
          <Field
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Search people"
          />
          {filtered.length === 0 ? (
            <Text muted>No one matches “{query.trim()}”.</Text>
          ) : (
            <Card style={{ paddingVertical: Spacing.xs }}>
              {filtered.map((p, i) => {
                const next = nextByPerson.get(p.id);
                const subtitle = [relationshipLabel(p.relationship_type), next ? `${next.title} ${describeDaysUntil(next.days).toLowerCase()}` : null]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <View key={p.id}>
                    {i > 0 ? <Divider /> : null}
                    <Row
                      onPress={() => router.push({ pathname: '/person/[id]', params: { id: p.id } })}
                      leading={<Avatar person={p} />}
                      title={getPersonDisplayName(p)}
                      subtitle={subtitle}
                    />
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}
    </TabScreen>
  );
}
