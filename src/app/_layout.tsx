import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/auth';
import { QueryProvider } from '@/providers/query';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: palette.background,
          card: palette.background,
          text: palette.textStrong,
          border: palette.border,
          primary: palette.textStrong,
        },
      }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        {/* Reachable signed in or out: it finishes sign-in, then the guards take over. */}
        <Stack.Screen name="auth/callback" />
      </Stack>
    </ThemeProvider>
  );
}
