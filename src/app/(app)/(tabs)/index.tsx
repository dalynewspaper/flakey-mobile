import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { sortUpcoming, useEvents, useNudgeAction, useNudges, useProfile, type Nudge } from '@/features/data';
import { UpcomingRow } from '@/features/upcoming-row';
import { useTheme } from '@/hooks/use-theme';
import { getPushStatus, registerForPush, type PushStatus } from '@/lib/push';
import { useAuth } from '@/providers/auth';
import { Button, Card, Divider, EmptyState, ErrorNotice, Loading, SectionLabel, Text } from '@/ui';
import { TabScreen } from '@/ui/tab-screen';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const router = useRouter();
  const t = useTheme();
  const { user } = useAuth();
  const profile = useProfile();
  const events = useEvents();
  const nudges = useNudges();
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      getPushStatus().then(setPushStatus);
    }, []),
  );

  const refreshing = events.isRefetching || nudges.isRefetching;
  const refresh = () => {
    events.refetch();
    nudges.refetch();
  };

  if (events.isPending) return <Loading />;

  const upcoming = sortUpcoming(events.data, 30);
  const firstName = profile.data?.name?.split(' ')[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const enableReminders = async () => {
    if (!user) return;
    try {
      const status = await registerForPush(user.id, { prompt: true });
      setPushStatus(status);
      if (status === 'denied') {
        Alert.alert('Notifications are off', 'Turn them on for Flakey in your phone settings to get reminders.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ]);
      }
    } catch (e) {
      Alert.alert("Couldn't turn on reminders", e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <TabScreen eyebrow={today} title={firstName ? `${greeting()}, ${firstName}.` : `${greeting()}.`} refreshing={refreshing} onRefresh={refresh}>
      {pushStatus === 'undetermined' ? (
        <Card tone="ink" style={{ gap: Spacing.md }}>
          <Text variant="heading" style={{ color: t.onPrimary }}>
            Never be the flaky friend.
          </Text>
          <Text style={{ color: t.onPrimary, opacity: 0.8 }}>
            Get a nudge on your phone before birthdays and key dates, with time to plan something kind.
          </Text>
          <Button title="Turn on reminders" variant="secondary" onPress={enableReminders} />
        </Card>
      ) : null}

      <View style={{ gap: Spacing.sm }}>
        <SectionLabel>Next 30 days</SectionLabel>
        {events.isError ? (
          <ErrorNotice error={events.error} onRetry={() => events.refetch()} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="A quiet month"
            body={(events.data?.length ?? 0) === 0 ? 'Add the people who matter and their key dates will show up here.' : 'Nothing coming up in the next 30 days.'}
            action={<Button title="Add someone" onPress={() => router.push('/person/new')} />}
          />
        ) : (
          <Card style={{ paddingVertical: Spacing.xs }}>
            {upcoming.map((e, i) => (
              <View key={e.id}>
                {i > 0 ? <Divider /> : null}
                <UpcomingRow event={e} />
              </View>
            ))}
          </Card>
        )}
      </View>

      {nudges.data && nudges.data.length > 0 ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Worth a moment</SectionLabel>
          {nudges.data.map((n) => (
            <NudgeCard key={n.id} nudge={n} />
          ))}
        </View>
      ) : null}
    </TabScreen>
  );
}

function NudgeCard({ nudge }: { nudge: Nudge }) {
  const router = useRouter();
  const action = useNudgeAction();
  const run = (a: 'mark_sent' | 'dismiss' | 'snooze') =>
    action.mutate(
      { nudgeId: nudge.id, action: a, snoozeDays: a === 'snooze' ? 3 : undefined },
      { onError: (e) => Alert.alert('Something went wrong', e instanceof Error ? e.message : '') },
    );

  return (
    <Card style={{ gap: Spacing.md }}>
      <View style={{ gap: Spacing.xs }}>
        <Text variant="heading">{nudge.title}</Text>
        <Text muted>{nudge.reason}</Text>
      </View>
      {nudge.drafted_message ? (
        <Card tone="surface" style={{ padding: Spacing.md }}>
          <Text variant="caption" muted>
            A message you could send
          </Text>
          <Text selectable>{nudge.drafted_message}</Text>
        </Card>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <Button title="Done" onPress={() => run('mark_sent')} disabled={action.isPending} style={{ flexGrow: 1 }} />
        <Button title="Later" variant="secondary" onPress={() => run('snooze')} disabled={action.isPending} style={{ flexGrow: 1 }} />
        <Button title="Dismiss" variant="ghost" onPress={() => run('dismiss')} disabled={action.isPending} />
      </View>
      {nudge.person_id ? (
        <Button
          title="Open their profile"
          variant="ghost"
          onPress={() => router.push({ pathname: '/person/[id]', params: { id: nudge.person_id! } })}
        />
      ) : null}
    </Card>
  );
}
