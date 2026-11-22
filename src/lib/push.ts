import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

/**
 * Notification permission and (optional) server push registration.
 *
 * Reminders are scheduled on the device by localReminders.ts. Server push
 * (send-event-reminders -> send-push-notification -> APNs/FCM) would send the
 * same reminders a second time, so registering this phone's token is off by
 * default. Set REMOTE_PUSH_ENABLED to true to switch to server push instead,
 * and stop scheduling local reminders at the same time.
 *
 * When on, we register the *native* token (getDevicePushTokenAsync) into
 * public.device_tokens, which is what the backend sends to.
 */
export const REMOTE_PUSH_ENABLED = false;

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
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Asks for notification permission if needed; with server push on, also saves this device's token. */
export async function registerForPush(userId: string, { prompt }: { prompt: boolean }): Promise<PushStatus> {
  if (Platform.OS === 'web') return 'unsupported';

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
  if (status !== 'granted' || !REMOTE_PUSH_ENABLED || !Device.isDevice) return status;

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
