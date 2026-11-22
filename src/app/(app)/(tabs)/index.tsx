import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { sortUpcoming, useEvents, useProfile } from '@/features/data';
import { UpcomingRow } from '@/features/upcoming-row';
import { useTheme } from '@/hooks/use-theme';
import { toReminderEvents } from '@/features/reminders';
import { syncLocalReminders } from '@/lib/localReminders';
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
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      getPushStatus().then(setPushStatus);
    }, []),
  );


  if (events.isPending) return <Loading />;

  const upcoming = sortUpcoming(events.data, 30);
  const firstName = profile.data?.name?.split(' ')[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const enableReminders = async () => {
    if (!user) return;
    try {
      const status = await registerForPush(user.id, { prompt: true });
      setPushStatus(status);
      if (status === 'granted') await syncLocalReminders(toReminderEvents(events.data));
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
    <TabScreen eyebrow={today} title={firstName ? `${greeting()}, ${firstName}.` : `${greeting()}.`} refreshing={events.isRefetching} onRefresh={() => events.refetch()}>
      {pushStatus === 'undetermined' ? (
        <Card tone="ink" style={{ gap: Spacing.md }}>
          <Text variant="heading" style={{ color: t.onPrimary }}>
            Never be the flaky friend.
          </Text>
          <Text style={{ color: t.onPrimary, opacity: 0.8 }}>
            Get a reminder on your phone before birthdays and key dates, with time to plan something kind.
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

    </TabScreen>
  );
}
