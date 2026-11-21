# Flakey mobile

The iOS and Android app for [Flakey](https://flakey.app), built with Expo SDK 58 and Expo Router.

It connects to the same Supabase project as the web app (built in Lovable), so you sign in with the same email and see the same people and key dates. All data access goes through the existing tables and row-level security. The app makes no backend changes.

## What's in v1

- **Sign in** with an email link that opens the app, or the 6-digit code from the same email (see "Sign-in setup").
- **Today:** key dates in the next 30 days.
- **People:** search your circle, open a profile, and add, edit or remove people. Adding someone creates the same automatic key dates as the web wizard: birthday, Mother's or Father's Day, Valentine's Day, Sibling Day and Christmas, depending on the relationship.
- **Dates:** the year ahead grouped by month. Add, edit or delete key dates, either yearly or one-off.
- **Settings:** push reminders on or off, and sign out.
- **Push reminders:** this phone's push token is saved to `device_tokens`. Tapping a reminder opens that key date.

The app is deliberately focused on remembering birthdays and important dates. Gifts, moments, nudges, the concierge and shared lists are left out on purpose.

## Run it

```bash
cp .env.example .env     # public Supabase URL and publishable key
npm install
npx expo start
```

Everything except push notifications runs in Expo Go. Push needs a development build:

```bash
npx eas-cli@latest build --profile development --platform ios
```

Before running `eas build` for the first time, run `npx eas-cli@latest init`. It links the project and adds `extra.eas.projectId` to `app.json`.

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Sign-in setup (one-time, in Supabase)

The email link sends people back to the app at `flakey://auth/callback`. Supabase only redirects to allow-listed URLs, so add these under **Authentication > URL Configuration > Redirect URLs**:

- `flakey://auth/callback` (development and store builds)
- `exp://**` (only needed for testing in Expo Go)

**6-digit code:** the app also accepts the code from the sign-in email, which is handy when the email is opened on a different device. The web app's magic-link template (`supabase/functions/_shared/email-templates/magic-link.tsx`) receives `token` but doesn't display it yet. Add it to the template to turn this on.

## Push reminders

The daily `send-event-reminders` job sends a push to every user with a registered device, whatever their other reminder settings. It runs 30, 10, 3 and 1 days before each date and on the day itself. It calls `send-push-notification`, which sends iOS tokens to APNs and Android tokens to FCM, using the native device tokens this app saves. Each platform is independent: if one isn't configured, the other still sends.

**iOS**

1. Set these secrets on the Supabase functions: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY` (the .p8 key) and `APNS_BUNDLE_ID=app.flakey.ios`. The bundle ID must match `ios.bundleIdentifier` in `app.json`.
2. Set `APNS_ENVIRONMENT=sandbox` while testing development builds, then `production` for TestFlight and App Store builds. Device tokens only work against their matching environment.

**Android**

1. Create a Firebase project and add an Android app with the package `app.flakey.android`.
2. Download `google-services.json` into the repo root and add `"googleServicesFile": "./google-services.json"` under `android` in `app.json`. Without it, Android can't issue a push token.
3. In Firebase, under Project settings > Service accounts, generate a private key. Save the whole JSON file's contents as the Supabase secret `FCM_SERVICE_ACCOUNT_JSON`.

Notifications arrive on the `reminders` Android channel, which the app creates.

## Project layout

```
src/app/                 Expo Router routes
  _layout.tsx            fonts, providers, auth-gated stacks (Stack.Protected)
  sign-in.tsx, auth/callback.tsx
  (app)/(tabs)/          Today, People, Dates, Settings (NativeTabs)
  (app)/person/          [id] profile, new, edit
  (app)/date/edit.tsx    add or edit a key date (?id= or ?personId=)
src/features/data.ts     TanStack Query hooks over Supabase
src/lib/                 supabase client, push, date and people helpers, generated DB types
src/ui/                  Paper & Ink components (Text, Button, Card, Field, DateField, etc.)
```

`src/lib/database.types.ts` is copied from the web app (`src/integrations/supabase/types.ts`). Re-copy it when the schema changes. `src/lib/autoDates.ts` and `src/lib/dates.ts` mirror web logic and say which files they follow.
