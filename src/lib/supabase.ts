import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.',
  );
}

/**
 * Same Supabase project as the Flakey web app, so a user signed in here sees
 * exactly the same people, dates and nudges. Row-level security scopes every
 * query to the signed-in user.
 */
export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Native apps receive auth redirects as deep links, handled in app/auth/callback.
    detectSessionInUrl: false,
  },
});

// Only refresh tokens while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
