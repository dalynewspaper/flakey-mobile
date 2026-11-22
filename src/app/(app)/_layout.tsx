import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocalReminderSync } from '@/features/reminders';
import { eventIdFromNotification, registerForPush } from '@/lib/push';
import { useAuth } from '@/providers/auth';

export const unstable_settings = { anchor: '(tabs)' };

export default function AppLayout() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const lastResponse = Notifications.useLastNotificationResponse();
  useLocalReminderSync();

  // With server push on, refresh this device's token on launch (no-op otherwise).
  useEffect(() => {
    if (user) registerForPush(user.id, { prompt: false }).catch(() => undefined);
  }, [user]);

  // Tapping a reminder opens that key date.
  useEffect(() => {
    if (!lastResponse) return;
    const eventId = eventIdFromNotification(lastResponse);
    if (eventId) router.push({ pathname: '/date/edit', params: { id: eventId } });
    Notifications.clearLastNotificationResponse();
  }, [lastResponse, router]);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.textStrong,
        headerTitleStyle: { fontFamily: Fonts.display },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: t.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="person/[id]" options={{ title: '' }} />
      <Stack.Screen name="person/new" options={{ presentation: 'modal', title: 'Add someone' }} />
      <Stack.Screen name="person/edit" options={{ presentation: 'modal', title: 'Edit' }} />
      <Stack.Screen name="date/edit" options={{ presentation: 'modal', title: 'Key date' }} />
    </Stack>
  );
}
