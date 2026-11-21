import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

/**
 * Push reminders reuse the web app's backend as-is:
 *  - tokens go into public.device_tokens (one row per user + token)
 *  - the send-event-reminders job calls send-push-notification, which talks to
 *    APNs directly with the native device token.
 * So we register the *native* token (getDevicePushTokenAsync), not an Expo push
 * token. Android tokens (FCM) are stored too, but the backend only sends to
 * iOS today.
 */

const STORED_TOKEN_KEY = 'flakey.pushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type PushStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPushStatus(): Promise<PushStatus> {
  if (!Device.isDevice || Platform.OS === 'web') return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Asks for permission if needed, then saves this device's token for the user. */
export async function registerForPush(userId: string, { prompt }: { prompt: boolean }): Promise<PushStatus> {
  if (!Device.isDevice || Platform.OS === 'web') return 'unsupported';

  if (Platform.OS === 'android') {
    // The channel must exist before asking, or Android 13+ won't show the prompt.
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: AndroidImportance.DEFAULT,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && prompt) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return status;

  const { data: token, type } = await Notifications.getDevicePushTokenAsync();
  if (typeof token !== 'string' || !token) return status;

  const { error } = await supabase.from('device_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: type, // 'ios' | 'android'
      device_name: Device.deviceName ?? Device.modelName ?? null,
      app_version: Application.nativeApplicationVersion ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );
  if (error) throw error;

  await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
  return status;
}

/** Removes this device's token so a signed-out phone stops getting reminders. */
export async function unregisterPushToken(): Promise<void> {
  const token = await AsyncStorage.getItem(STORED_TOKEN_KEY);
  if (!token) return;
  await supabase.from('device_tokens').delete().eq('token', token);
  await AsyncStorage.removeItem(STORED_TOKEN_KEY);
}

/** Pulls the event id out of a reminder push (APNs payload keys sit at the top level). */
export function eventIdFromNotification(response: Notifications.NotificationResponse): string | null {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const id = data?.event_id;
  return typeof id === 'string' ? id : null;
}
