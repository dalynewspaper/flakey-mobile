import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/providers/auth';
import { Button, Card, Field, Screen, Text } from '@/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('rate') || m.includes('seconds')) return 'Please wait a minute before asking for another email.';
  if (m.includes('expired') || m.includes('invalid')) return 'That code has expired or is wrong. Request a new email.';
  return message;
}

export default function SignInScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { sendEmailSignIn, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await sendEmailSignIn(email);
    setBusy(false);
    if (err) setError(friendlyAuthError(err.message));
    else setStep('sent');
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await verifyEmailCode(email, code);
    setBusy(false);
    if (err) setError(friendlyAuthError(err.message));
    // On success the auth guard swaps this screen for the app.
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentContainerStyle={{ paddingTop: insets.top + Spacing.xxl, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.accent }} />
          <Text variant="heading">Flakey</Text>
        </View>

        <View style={{ gap: Spacing.sm, marginVertical: Spacing.lg }}>
          <Text variant="hero">Soft tools for hard-to-keep ties.</Text>
          <Text muted>Sign in with the same email you use on flakey.app. Your people and dates come with you.</Text>
        </View>

        {step === 'email' ? (
          <Card style={{ gap: Spacing.lg }}>
            <Field
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError(null);
              }}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={send}
              error={error}
            />
            <Button title="Email me a sign-in link" onPress={send} loading={busy} />
          </Card>
        ) : (
          <Card style={{ gap: Spacing.lg }}>
            <View style={{ gap: Spacing.xs }}>
              <Text variant="heading">Check your inbox</Text>
              <Text muted>
                We sent a sign-in link to {email.trim()}. Open it on this phone and Flakey will sign you in.
              </Text>
            </View>
            <Field
              label="Or enter the code from the email"
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, '').slice(0, 8));
                setError(null);
              }}
              placeholder="12345678"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={8}
              error={error}
            />
            <Button title="Sign in with code" onPress={verify} loading={busy} disabled={code.length < 6} />
            <Button
              title="Use a different email"
              variant="ghost"
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
            />
          </Card>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
