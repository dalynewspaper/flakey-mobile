import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth';
import { Button, Loading, Text } from '@/ui';

/**
 * Landing route for the email sign-in link (flakey://auth/callback#access_token=...).
 * Tokens can arrive in the #fragment, which route params don't include, so we
 * read the raw incoming URL instead.
 */
export default function AuthCallback() {
  const t = useTheme();
  const router = useRouter();
  const url = Linking.useLinkingURL();
  const { completeSignInFromUrl, session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url) return;
    handled.current = url;
    completeSignInFromUrl(url).then(({ error: err }) => {
      if (err) setError(err.message);
      else router.replace('/');
    });
  }, [url, completeSignInFromUrl, router]);

  useEffect(() => {
    if (session && !error) router.replace('/');
  }, [session, error, router]);

  if (!error) return <Loading />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg, backgroundColor: t.background }}>
      <Text variant="title">That link didn&apos;t work</Text>
      <Text muted>{error}</Text>
      <Button title="Back to sign in" onPress={() => router.replace('/sign-in')} />
    </View>
  );
}
