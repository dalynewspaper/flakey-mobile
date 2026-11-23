import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReminderTapRouting } from '@/features/reminder-taps';
import { useLocalReminderSync } from '@/features/reminders';
import { registerForPush } from '@/lib/push';
import { useAuth } from '@/providers/auth';

export const unstable_settings = { anchor: '(tabs)' };

export default function AppLayout() {
  const t = useTheme();
  const { user } = useAuth();
  useLocalReminderSync();
  useReminderTapRouting();

  // With server push on, refresh this device's token on launch (no-op otherwise).
  useEffect(() => {
    if (user) registerForPush(user.id, { prompt: false }).catch(() => undefined);
  }, [user]);

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
