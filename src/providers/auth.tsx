import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { clearLocalReminders } from '@/lib/localReminders';
import { unregisterPushToken } from '@/lib/push';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Emails a sign-in link that deep-links back into the app (and a 6-digit code, if the template shows it). */
  sendEmailSignIn: (email: string) => Promise<{ error: Error | null }>;
  /** Signs in with the 6-digit code from the sign-in email. */
  verifyEmailCode: (email: string, code: string) => Promise<{ error: Error | null }>;
  /** Completes sign-in from a flakey://auth/callback deep link. */
  completeSignInFromUrl: (url: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AUTH_REDIRECT_URL = Linking.createURL('auth/callback');

/** Reads params from both the query string and the #fragment of an auth redirect. */
function readAuthParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : '';
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  for (const part of [query, fragment]) {
    new URLSearchParams(part).forEach((value, key) => params.set(key, value));
  }
  return params;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const sendEmailSignIn: AuthContextValue['sendEmailSignIn'] = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: AUTH_REDIRECT_URL },
    });
    return { error };
  };

  const verifyEmailCode: AuthContextValue['verifyEmailCode'] = async (email, code) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    return { error };
  };

  const completeSignInFromUrl: AuthContextValue['completeSignInFromUrl'] = async (url) => {
    const params = readAuthParams(url);
    const errorDescription = params.get('error_description') ?? params.get('error');
    if (errorDescription) return { error: new Error(errorDescription.replace(/\+/g, ' ')) };

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      return { error };
    }

    const tokenHash = params.get('token_hash');
    if (tokenHash) {
      const type = (params.get('type') as 'magiclink' | 'email' | 'signup' | null) ?? 'magiclink';
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      return { error };
    }

    const code = params.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return { error };
    }

    return { error: new Error('This sign-in link is missing its token. Request a new one.') };
  };

  const signOut = async () => {
    await clearLocalReminders().catch(() => undefined);
    await unregisterPushToken().catch(() => undefined);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        sendEmailSignIn,
        verifyEmailCode,
        completeSignInFromUrl,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
