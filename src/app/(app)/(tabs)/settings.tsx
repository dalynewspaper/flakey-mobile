import * as Application from 'expo-application';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useProfile } from '@/features/data';
import { getPushStatus, registerForPush, type PushStatus } from '@/lib/push';
import { useAuth } from '@/providers/auth';
import { Button, Card, Divider, Row, SectionLabel, Text } from '@/ui';
import { TabScreen } from '@/ui/tab-screen';

const WEB_APP = 'https://flakey.app';

const PUSH_COPY: Record<PushStatus, string> = {
  granted: 'On for this phone',
  denied: 'Off. Turn on in phone settings',
  undetermined: 'Not set up yet',
  unsupported: 'Needs a real device',
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPushStatus().then(setPushStatus);
    }, []),
  );

  const onPush = async () => {
    if (!user) return;
    if (pushStatus === 'denied') {
      Linking.openSettings();
      return;
    }
    setBusy(true);
    try {
      setPushStatus(await registerForPush(user.id, { prompt: true }));
    } catch (e) {
      Alert.alert("Couldn't turn on reminders", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'This phone will stop getting reminders until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <TabScreen title="Settings">
      <View style={{ gap: Spacing.sm }}>
        <SectionLabel>Account</SectionLabel>
        <Card style={{ paddingVertical: Spacing.xs }}>
          <Row title={profile.data?.name || 'Your account'} subtitle={user?.email ?? undefined} />
        </Card>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <SectionLabel>Reminders</SectionLabel>
        <Card style={{ gap: Spacing.md }}>
          <View style={{ gap: Spacing.xs }}>
            <Text variant="label">Push notifications</Text>
            <Text muted>{pushStatus ? PUSH_COPY[pushStatus] : ' '}</Text>
          </View>
          {pushStatus === 'undetermined' || pushStatus === 'denied' ? (
            <Button
              title={pushStatus === 'denied' ? 'Open phone settings' : 'Turn on reminders'}
              variant="secondary"
              onPress={onPush}
              loading={busy}
            />
          ) : null}
          <Divider />
          <Text variant="caption" muted>
            Email and WhatsApp reminders, timing and quiet hours are managed on flakey.app.
          </Text>
          <Button title="Reminder settings on the web" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP}/settings`)} />
        </Card>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <SectionLabel>More on the web</SectionLabel>
        <Card style={{ paddingVertical: Spacing.xs }}>
          <Row title="Gifts" subtitle="Ideas, history and requests" onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP}/gifts`)} />
          <Divider />
          <Row title="Moments" subtitle="Your feed of memories" onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP}/feed`)} />
          <Divider />
          <Row title="Privacy" onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP}/privacy`)} />
          <Divider />
          <Row title="Terms" onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP}/terms`)} />
        </Card>
      </View>

      <Button title="Sign out" variant="danger" onPress={confirmSignOut} />
      <Text variant="caption" muted style={{ textAlign: 'center' }}>
        Flakey {Application.nativeApplicationVersion ?? ''}
      </Text>
    </TabScreen>
  );
}
